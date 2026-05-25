import inquirer from 'inquirer';
import { scrapePage } from './scraper';
import { analyzeAndGenerateTests } from './analyzer';
import { generatePlaywrightTests, saveTestFile } from './generator';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

async function main() {
  console.log('\n==========================================');
  console.log('  **AI Test Generator**');
  console.log('  Automated test generation for websites.');
  console.log('  Generation time may vary based on the');
  console.log('  size and complexity of your website.');
  console.log('==========================================\n');

  const { url } = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter the website address you want to test:',
      default: process.argv[2],
      validate: (input: string) => {
        if (!input) return 'Please enter a website address';
        if (!input.startsWith('http')) return 'Please enter a valid website address starting with http:// or https://';
        return true;
      }
    }
  ]);

  console.log('\n⏳ Analyzing your website, please wait...');
  const pageData = await scrapePage(url);
  console.log('✅ Website analysis complete');

  console.log('\n⏳ Generating test cases, please wait...');
  const testCases = await analyzeAndGenerateTests(pageData);
  console.log(`✅ Successfully created ${testCases.length} test cases`);

  console.log('\n⏳ Preparing your test files...');
  const testContent = generatePlaywrightTests(testCases, pageData);
  const filePath = saveTestFile(testContent, pageData);
  console.log('✅ Test files are ready');

  console.log('\n📋 Here is a summary of your generated tests:\n');
  testCases.forEach((tc, i) => {
    const priority = tc.priority === 'high' ? '🔴 High'
      : tc.priority === 'medium' ? '🟡 Medium'
      : '🟢 Low';
    console.log(`  ${i + 1}. ${tc.name} — Priority: ${priority}`);
  });
  console.log('\n⏳ Running your tests, please wait...');
  try {
    const normalizedPath = filePath.replace(/\\/g, '/');
    execSync('npx rimraf allure-results', { stdio: 'inherit' });
    execSync(`npx playwright test "${normalizedPath}"`, { stdio: 'inherit' });
    console.log('\n✅ All tests completed');
  } catch {
    console.log('\n⚠️  Some tests did not pass. Check the report for details.');
  }

  console.log('\n⏳ Opening your test report...');
  try {
    execSync('npx allure serve allure-results', { stdio: 'inherit' });
  } catch {
    console.log('\n⚠️  Could not open the report. Run "npx allure serve allure-results" manually.');
  }

  console.log('\n==========================================');
  console.log('   ✅ All done! Your tests are ready.');
  console.log('==========================================\n');
}

main().catch(console.error);