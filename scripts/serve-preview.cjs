'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8' };
http.createServer(async (request,response) => {
  try {
    const name = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const file = path.resolve(root, '.' + name);
    const relative = path.relative(root,file);
    if (!['GET','HEAD'].includes(request.method) || relative.startsWith('..') || path.isAbsolute(relative) || !/^(scripts|extension|tests\/fixtures)\//.test(relative)) {
      response.writeHead(403); response.end(); return;
    }
    const data = await fs.readFile(file);
    response.writeHead(200, { 'Content-Type':types[path.extname(file)] || 'text/plain; charset=utf-8', 'Cache-Control':'no-store' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404); response.end(); }
}).listen(8765,'127.0.0.1', () => console.log('Original fixture preview: http://127.0.0.1:8765/scripts/preview.html'));
