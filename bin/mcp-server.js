#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { updateLaws, LAWS } = require("../lib/law-fetcher");
const { search } = require("../lib/search-engine");

const server = new Server(
  {
    name: "taiwan-urban-code-tracker",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools.
 * Tools: search_urban_regulations, update_urban_laws, list_urban_laws
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_urban_regulations",
        description: "Search for Taiwan urban planning laws and regulations by keyword (e.g., '住宅區', '容積率').",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "The keyword to search for in law titles and article content.",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default 5).",
              default: 5,
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "list_urban_laws",
        description: "List all urban planning laws and their PCodes covered by this tracker.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "update_urban_laws",
        description: "Update the local law database by downloading latest JSON from g0v sources. Run this if search results are missing or outdated.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_urban_regulations": {
        const keyword = args.keyword;
        const limit = args.limit || 5;
        const results = search(keyword);

        if (results.length === 0) {
          return {
            content: [{ type: "text", text: `No matching articles found for "${keyword}". Try running "update_urban_laws" first.` }],
            isError: false,
          };
        }

        const formattedResults = results.slice(0, limit).map((res, index) => {
          const item = res.item;
          return `[${index + 1}] ${item.lawName} - ${item.articleNo}\n${item.content}\n---`;
        }).join("\n");

        return {
          content: [{ type: "text", text: `Found ${results.length} results. Displaying top ${limit}:\n\n${formattedResults}` }],
        };
      }

      case "list_urban_laws": {
        const lawList = LAWS.map(law => `${law.pcode}: ${law.name}`).join("\n");
        return {
          content: [{ type: "text", text: `Covered laws:\n${lawList}` }],
        };
      }

      case "update_urban_laws": {
        // Since updateLaws is async and might take time, we trigger it.
        // In a real stdio server, we should await but provide feedback.
        await updateLaws();
        return {
          content: [{ type: "text", text: "Law database successfully updated." }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

/**
 * Start the server using stdio transport.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Taiwan Urban Code Tracker MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
