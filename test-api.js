require('dotenv').config();
const { exec } = require('child_process');

console.log('Running API connection test...\n');

const child = exec('npx ts-node src/utils/testApi.ts');

child.stdout.on('data', (data) => {
  console.log(data);
});

child.stderr.on('data', (data) => {
  console.error(`Error: ${data}`);
});

child.on('close', (code) => {
  console.log(`Test completed with code ${code}`);
});
