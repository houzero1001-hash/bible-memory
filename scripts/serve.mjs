import http from 'node:http';import {readFile,stat} from 'node:fs/promises';import path from 'node:path';
const base=path.resolve(process.argv[2]||'dist'),port=Number(process.env.PORT||5190);const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
const json=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
http.createServer(async(req,res)=>{try{
 if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){json(res,403,{error:'不允许的主机'});return;}
 const url=new URL(req.url,'http://'+req.headers.host);let p=decodeURIComponent(url.pathname);if(p.startsWith('/bible-memory/'))p=p.slice('/bible-memory'.length);
 if(p.startsWith('/api/')){
  if(req.method!=='GET'){json(res,405,{error:'仅支持 GET'});return;}
  if((req.headers.origin&&req.headers.origin!==url.origin)||req.headers['sec-fetch-site']==='cross-site'){json(res,403,{error:'只允许本地应用发起查询'});return;}
  json(res,404,{error:'没有该接口'});return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 if(p==='/__qa/'){const body=await readFile(new URL('../tests/browser.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(body);return;}
 if(p.split('/').some(x=>x.startsWith('.'))){res.writeHead(404);res.end();return;}
 let f=path.resolve(base,'.'+p);if(!f.startsWith(base+path.sep)&&f!==base)throw Error();if((await stat(f)).isDirectory())f=path.join(f,'index.html');const body=await readFile(f);res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Bible Memory: http://127.0.0.1:${port}/bible-memory/`));
