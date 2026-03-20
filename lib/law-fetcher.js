const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cliProgress = require('cli-progress');
const chalk = require('chalk');

const LAWS = [
  { name: '都市計畫法', pcode: 'D0070001' },
  { name: '都市計畫法臺灣省施行細則', pcode: 'D0070002' },
  { name: '都市計畫法臺北市施行細則', pcode: 'D0070003' },
  { name: '都市計畫法高雄市施行細則', pcode: 'D0070005' },
  { name: '都市計畫法新北市施行細則', pcode: 'D0070068' },
  { name: '都市計畫法桃園市施行細則', pcode: 'D0070104' },
  { name: '都市計畫法臺中市施行細則', pcode: 'D0070067' },
  { name: '都市更新條例', pcode: 'D0070008' },
  { name: '都市更新條例施行細則', pcode: 'D0070009' },
  { name: '區域計畫法', pcode: 'D0070030' },
  { name: '區域計畫法施行細則', pcode: 'D0070031' },
  { name: '國土計畫法', pcode: 'D0070230' },
  { name: '國土計畫法施行細則', pcode: 'D0070243' }
];

const DATA_DIR = path.join(__dirname, '../data');

async function fetchLaw(law) {
  const url = `https://raw.githubusercontent.com/kong0107/mojLawSplitJSON/master/FalVMingLing/${law.pcode}.json`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    const filePath = path.join(DATA_DIR, `${law.pcode}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(chalk.red(`\nFailed to fetch ${law.name} (${law.pcode}): ${error.message}`));
    return false;
  }
}

async function updateLaws() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log(chalk.cyan('Updating urban planning laws...'));
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(LAWS.length, 0);

  let successCount = 0;
  for (let i = 0; i < LAWS.length; i++) {
    const success = await fetchLaw(LAWS[i]);
    if (success) successCount++;
    bar.update(i + 1);
  }

  bar.stop();
  console.log(chalk.green(`\nSuccessfully updated ${successCount}/${LAWS.length} laws.`));
}

module.exports = {
  updateLaws,
  LAWS
};
