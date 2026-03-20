#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { updateLaws, LAWS } = require('../lib/law-fetcher');
const { search } = require('../lib/search-engine');

const program = new Command();

program
  .name('ncp')
  .description('National Code Planner - Taiwan Urban Planning Law Search Tool')
  .version('1.0.0');

program
  .command('search')
  .description('Search for urban planning laws by keyword')
  .argument('<keyword>', 'keyword to search for')
  .option('-l, --limit <number>', 'limit the number of results', 5)
  .action(async (keyword, options) => {
    console.log(chalk.cyan(`Searching for: "${keyword}"...`));
    const results = search(keyword);
    
    if (results.length === 0) {
      console.log(chalk.red('No matching articles found.'));
      return;
    }

    const limit = parseInt(options.limit);
    const displayedResults = results.slice(0, limit);

    console.log(chalk.green(`\nFound ${results.length} results. Displaying top ${displayedResults.length}:`));
    
    displayedResults.forEach((res, index) => {
      const item = res.item;
      let content = item.content;
      
      // Basic keyword highlighting
      try {
        const regex = new RegExp(`(${keyword})`, 'gi');
        content = content.replace(regex, chalk.bgYellow.black('$1'));
      } catch (e) {
        // Fallback if keyword contains special regex characters
      }

      console.log(chalk.yellow(`\n[${index + 1}] ${item.lawName} - ${item.articleNo}`));
      console.log(chalk.white(content));
      console.log(chalk.gray('-'.repeat(40)));
    });
  });

program
  .command('update')
  .description('Download and update urban planning law data from MOJ')
  .action(async () => {
    await updateLaws();
  });

program
  .command('list')
  .description('List laws included in this tool')
  .action(() => {
    console.log(chalk.cyan('Included laws:'));
    LAWS.forEach(law => {
      console.log(`${chalk.yellow(law.pcode)}: ${law.name}`);
    });
  });

program.parse(process.argv);
