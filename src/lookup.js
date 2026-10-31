import {parseReference} from './books.js';
export const CUV_ORIGIN='https://api.getbible.net';
export function chapterURL(p,version='cuv'){const id=version==='cuv'?'cus':'kjv';return `${CUV_ORIGIN}/v2/${id}/${p.bookNumber}/${p.chapter}.json`;}
export const cuvURL=p=>chapterURL(p,'cuv');
export function chapterResult(data,p,version='cuv'){
 const id=version==='cuv'?'cus':'kjv';
 if(!data||data.abbreviation!==id||data.book_nr!==p.bookNumber||data.chapter!==p.chapter||!Array.isArray(data.verses))throw Error('来源返回了不匹配的书卷或版本，请稍后再试');
 const verses=[];for(let n=p.start;n<=p.end;n++){const matches=data.verses.filter(v=>v.verse===n&&v.chapter===p.chapter);if(matches.length!==1||typeof matches[0].text!=='string'||!matches[0].text.trim())throw Error(`来源没有返回第 ${n} 节的完整正文，请检查范围`);verses.push(matches[0].text);}
 return {reference:p.reference,text:verses.join('\n'),version:version==='cuv'?'和合本（简体）':'KJV',source:{provider:'getBible',url:chapterURL(p,version),versionId:id,copyright:version==='cuv'?'Public Domain · 和合本（简体） · getBible / CrossWire':'King James Version · getBible / CrossWire',retrievedAt:new Date().toISOString()}};
}
export const cuvResult=(data,p)=>chapterResult(data,p,'cuv');
export async function lookup(reference,version,{fetcher=fetch,signal}={}){
 const p=parseReference(reference);if(!['cuv','kjv'].includes(version))throw Error('请选择和合本或 KJV');
 const url=chapterURL(p,version);
 let response;try{response=await fetcher(url,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal});}catch(e){if(e.name==='AbortError')throw e;throw Error('网络连接失败，请检查网络后重试；已收藏经文仍可离线使用');}
 if(!response.ok){if(response.status===429)throw Error('来源请求过于频繁，请稍后再试');throw Error(response.status===404?'没有找到对应章节，请检查出处':'在线经文来源暂不可用，请稍后再试');}
 let data;try{data=await response.json();}catch{throw Error('经文来源返回了无效数据，请稍后重试');}return chapterResult(data,p,version);
}
