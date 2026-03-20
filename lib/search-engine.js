const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');
const chalk = require('chalk');

const DATA_DIR = path.join(__dirname, '../data');

function loadLaws() {
  if (!fs.existsSync(DATA_DIR)) {
    return [];
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const allArticles = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
      const lawName = data['法規名稱'];
      
      if (data['法規內容']) {
        data['法規內容'].forEach(item => {
          if (item['條號']) {
            allArticles.push({
              lawName: lawName,
              articleNo: item['條號'],
              content: item['條文內容'],
              fullText: `${lawName} ${item['條號']} ${item['條文內容']}`
            });
          }
        });
      }
    } catch (e) {
      // Skip invalid files
    }
  }

  return allArticles;
}

function search(keyword) {
  const articles = loadLaws();
  if (articles.length === 0) {
    console.log(chalk.yellow('No law data found. Please run "ncp update" first.'));
    return [];
  }

  const fuse = new Fuse(articles, {
    keys: ['content', 'lawName', 'articleNo'],
    threshold: 0.3,
    ignoreLocation: true
  });

  return fuse.search(keyword);
}

module.exports = {
  search
};
