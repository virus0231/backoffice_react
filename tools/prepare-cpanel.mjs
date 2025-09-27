import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, 'cpanel-dist');

const keepFiles = [
  'package.json',
  'package-lock.json',
  'next.config.js',
  'middleware.ts',
  'postcss.config.js',
  'tailwind.config.js',
  'tsconfig.json'
];

const keepDirs = [
  'public',
  'src',
  '.next' // optional; include if already built
];

const ignorePatterns = new Set([
  '.git',
  '.github',
  '.vscode',
  '.ai',
  '.bmad-core',
  'coverage',
  'docs',
  'tests',
  '__tests__',
  'web-bundles',
  '.next/cache'
]);

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dst) {
  mkdirp(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  mkdirp(dst);
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dst, entry);
    const rel = path.relative(projectRoot, s).replaceAll('\\', '/');
    if (ignorePatterns.has(entry) || ignorePatterns.has(rel)) continue;
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

rmrf(outDir);
mkdirp(outDir);

for (const f of keepFiles) {
  const src = path.join(projectRoot, f);
  if (fs.existsSync(src)) copyFile(src, path.join(outDir, f));
}

for (const d of keepDirs) {
  const src = path.join(projectRoot, d);
  if (fs.existsSync(src)) copyDir(src, path.join(outDir, d));
}

// Write a tiny README with start instructions
const readme = `Deployment (cPanel)

1) Ensure Node.js app configured on cPanel (Node 18+).
2) Upload the 'cpanel-dist' folder contents to your app directory.
3) From terminal: npm ci && npm run build (if .next not included), then npm start.
   - Or if '.next' is included, you can run npm ci --omit=dev && npm start.
4) Set the startup to 'npm start' or the working dir with Next's default server.
`;
fs.writeFileSync(path.join(outDir, 'README_DEPLOY.txt'), readme, 'utf8');

console.log(`Prepared cpanel-dist at: ${outDir}`);

