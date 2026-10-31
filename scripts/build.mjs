import {rm,mkdir,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');for(const p of ['index.html','src'])await cp(p,`dist/${p}`,{recursive:true});await cp('public','dist',{recursive:true});console.log('Built dist/ (relative paths, GitHub Pages ready)');
