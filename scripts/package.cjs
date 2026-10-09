'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
require('./check.cjs');
const root = path.join(__dirname, '..');
const version = require('../package.json').version;
const source = path.join(root, 'extension');
const output = path.join(root, 'dist', `higgsfield-zh-cn-v${version}.zip`);
const files = ['manifest.json', 'dictionary.js', 'engine.js', 'content.js', 'popup.html', 'popup.css', 'popup.js', 'LICENSE'];
const blocks = [];
const directories = [];
let offset = 0;
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
// Simple reproducible ZIP (stored entries). No tooling, dependencies or metadata
// outside this explicit extension allowlist enter the downloadable package.
for (const file of files) {
  const name = Buffer.from(file, 'utf8');
  const data = fs.readFileSync(path.join(file === 'LICENSE' ? root : source, file));
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0x21, 12); // 1980-01-01, no local timestamps.
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  blocks.push(header, name, data);
  const directory = Buffer.alloc(46);
  directory.writeUInt32LE(0x02014b50, 0);
  directory.writeUInt16LE(20, 4);
  directory.writeUInt16LE(20, 6);
  directory.writeUInt16LE(0x800, 8);
  directory.writeUInt16LE(0, 10);
  directory.writeUInt16LE(0, 12);
  directory.writeUInt16LE(0x21, 14);
  directory.writeUInt32LE(crc, 16);
  directory.writeUInt32LE(data.length, 20);
  directory.writeUInt32LE(data.length, 24);
  directory.writeUInt16LE(name.length, 28);
  directory.writeUInt32LE(offset, 42);
  directories.push(directory, name);
  offset += header.length + name.length + data.length;
}
const central = Buffer.concat(directories);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.concat([...blocks, central, end]));
const hash = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
fs.writeFileSync(`${output}.sha256`, `${hash}  ${path.basename(output)}\n`);
console.log(`Packaged ${files.length} files: dist/${path.basename(output)}`);
console.log(`SHA256 ${hash}`);
