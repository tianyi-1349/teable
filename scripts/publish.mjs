import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { execSync, spawnSync } from 'child_process';

const packages = [
  '@teable/sdk',
  '@teable/ui-lib',
  '@teable/openapi',
  '@teable/core',
  '@teable/common-i18n',
  '@teable/icons',
];
const npmToken = process.env.NPM_TOKEN;

const versionType = process.argv[2] || 'patch';
const tag = process.argv[3] || 'beta';

const ALLOWED_VERSION_TYPES = new Set([
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease',
]);

if (!ALLOWED_VERSION_TYPES.has(versionType)) {
  throw new Error(`Invalid version type: ${versionType}`);
}

if (!/^[a-z0-9][a-z0-9.-]*$/i.test(tag)) {
  throw new Error(`Invalid npm tag: ${tag}`);
}

if (!npmToken) {
  throw new Error('NPM_TOKEN is required');
}

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
};

const workspaceFilterArgs = packages.flatMap((pkg) => ['-F', pkg]);

const npmrcDir = mkdtempSync(join(tmpdir(), 'teable-publish-'));
const npmrcPath = join(npmrcDir, '.npmrc');

try {
  writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${npmToken}\n`, { mode: 0o600 });

  // run version update
  run('pnpm', [
    'version',
    versionType,
    `--preid=${tag}`,
    '-ws',
    '--include-workspace-root',
    '--no-git-tag-version',
    '--json',
    '--no-workspaces-update',
  ]);

  // run build
  run('pnpm', ['-r', ...workspaceFilterArgs, 'build']);

  // run publish
  run('pnpm', ['-r', ...workspaceFilterArgs, 'publish', '--tag', tag, '--no-git-checks'], {
    env: {
      ...process.env,
      NPM_CONFIG_USERCONFIG: npmrcPath,
    },
  });
} finally {
  rmSync(npmrcDir, { recursive: true, force: true });
}

// commit version update
const result = execSync('pnpm version --json', { encoding: 'utf-8' });

execSync('git add .', { stdio: 'inherit' });

execSync(
  `git commit -m "chore: publish ${JSON.parse(result)['@teable/teable']} release" --no-verify`,
  { stdio: 'inherit' }
);
