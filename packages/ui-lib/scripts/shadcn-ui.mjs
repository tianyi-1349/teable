import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'fs';
import { join } from 'path';
import data from '../components.json' assert { type: 'json' };

const { aliases } = data;

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
};

function fixAliases(componentName) {
  const fixFile = (filePath) => {
    let content = readFileSync(filePath, 'utf-8');

    // Replace utils path
    const replaceUtilsPath = join('../utils');
    content = content.replaceAll(aliases.utils, replaceUtilsPath);

    // Replace components path
    content = content.replaceAll(`${aliases.components}/ui/`, './');

    writeFileSync(filePath, content, 'utf-8');

    run('pnpm', ['eslint', filePath, '--fix']);

    console.log('Fixed.');
  };

  const folderPath = join(process.cwd(), aliases.components, 'ui');

  if (componentName) {
    const filePath = join(folderPath, `${componentName}.tsx`);
    fixFile(filePath);
    return;
  }

  readdirSync(folderPath).forEach((file) => {
    const filePath = join(folderPath, file);

    if (lstatSync(filePath).isDirectory()) {
      return;
    }
    fixFile(filePath);
  });
}

const args = process.argv.slice(2);

run('pnpm', ['dlx', 'shadcn@latest', 'add', ...args], { cwd: process.cwd() });

if (process.argv[2] === 'add') {
  fixAliases(process.argv[3]);
}
