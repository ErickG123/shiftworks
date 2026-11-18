import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import process from 'node:process';

const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const packages = Object.entries(lock.packages).filter(([path]) => path.startsWith('node_modules/'));
const modulesDirectory = fileURLToPath(new URL('../node_modules/', import.meta.url));
const counts = new Map();
const missingLicenseMetadata = [];
const missingRequiredInstallation = [];
for (const [path, metadata] of packages) {
  const license = metadata.license;
  if (license) counts.set(license, (counts.get(license) ?? 0) + 1);
  else missingLicenseMetadata.push(path);
  if (metadata.optional) continue;
  const manifestPath = resolve(modulesDirectory, path.slice('node_modules/'.length), 'package.json');
  try { await access(manifestPath); } catch { missingRequiredInstallation.push(path); }
}

process.stdout.write(`${JSON.stringify({ packageCount: packages.length, licenseCounts: Object.fromEntries(counts), missingLicenseMetadata, missingRequiredInstallation }, null, 2)}\n`);
if (missingLicenseMetadata.length > 0 || missingRequiredInstallation.length > 0) process.exitCode = 1;
