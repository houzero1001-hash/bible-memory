import {parseReference} from './books.js';
import {createVerse} from './core.js';
export const refKey=v=>{try{return parseReference(v.reference).passageId;}catch{return v.reference.trim();}};
const language=v=>v.version==='KJV'?'en':/^和合本(?:（简体）)?$/.test(v.version)?'zh':null;
export function joinPassages(parts){
 if(parts.length!==2||new Set(parts.map(refKey)).size!==1)throw Error('中英文出处不一致，不能合并');
 const zh=parts.find(v=>language(v)==='zh'),en=parts.find(v=>language(v)==='en');if(!zh||!en)throw Error('需要同一出处的和合本与 KJV');
 return {reference:zh.reference,text:`【和合本】\n${zh.text}\n\n【KJV】\n${en.text}`,version:'和合本 + KJV',source:{provider:'getBible',versionId:'cus+kjv',translations:structuredClone([zh,en])}};
}
export function collectBilingual(state,parts){
 const joined=joinPassages(parts),key=refKey(joined);
 const existing=state.verses.find(v=>refKey(v)===key&&v.version===joined.version);
 if(existing){if(existing.text!==joined.text)throw Error('已有同出处双语经文，正文不同，请在经文库核对后编辑');return existing;}
 const originals=state.verses.filter(v=>refKey(v)===key&&parts.some(p=>language(v)===language(p)&&v.text===p.text));
 const v={...createVerse(joined.reference,joined.text,joined.version),source:joined.source};
 if(originals.length){v.createdAt=originals.map(x=>x.createdAt).sort()[0];v.history=originals.flatMap(x=>x.history).filter((h,i,a)=>a.findIndex(x=>x.id===h.id)===i).sort((a,b)=>a.at.localeCompare(b.at));v.mergedRecords=structuredClone(originals);for(const field of ['lastStudyAt','lastReviewAt'])v[field]=originals.map(x=>x[field]).filter(Boolean).sort().at(-1)||null;
 // A newly added language needs learning; history stays intact, without granting bilingual mastery.
 if(originals.length===2&&originals.every(x=>x.status!=='pending')){v.stage=Math.min(...originals.map(x=>x.stage));v.status=originals.every(x=>x.status==='mastered')?'mastered':'learning';v.nextReview=originals.map(x=>x.nextReview).filter(Boolean).sort()[0]||null;v.completedDay=originals.every(x=>x.completedDay===originals[0].completedDay)?originals[0].completedDay:null;v.manualMastered=originals.every(x=>x.manualMastered);v.masteredAt=v.status==='mastered'?originals.map(x=>x.masteredAt).filter(Boolean).sort().at(-1)||null:null;}
 }
 state.verses=state.verses.filter(x=>!originals.some(o=>o.id===x.id));state.verses.push(v);
 if(originals.some(x=>x.id===state.session?.verseId))state.session=null;
 return v;
}
export function mergeExistingBilingual(state){
 const groups=new Map();for(const v of state.verses){if(!language(v))continue;const k=refKey(v);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(v);}
 let count=0;for(const group of groups.values()){if(group.length===2&&new Set(group.map(language)).size===2&&!state.verses.some(v=>refKey(v)===refKey(group[0])&&v.version==='和合本 + KJV')){collectBilingual(state,group);count++;}}return count;
}
