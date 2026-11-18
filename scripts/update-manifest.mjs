import { readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { URL, fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { stdout } from 'node:process';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifestPath = resolve(root, 'MANIFEST.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.generated_on = new Date().toISOString().slice(0, 10);
manifest.source_gdd = 'docs/design/GDD.md';
for (const entry of manifest.files) {
  const absolutePath = resolve(root, entry.path);
  const content = await readFile(absolutePath);
  entry.bytes = (await stat(absolutePath)).size;
  entry.sha256 = createHash('sha256').update(content).digest('hex');
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
stdout.write(`Updated ${manifest.files.length} manifest entries.\n`);
