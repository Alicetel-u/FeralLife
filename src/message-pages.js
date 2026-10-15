// Split at sentence/clause boundaries, preserving every character and line break.
export function messagePages(text,limit=48){
 const chars=Array.from(String(text??'')),pages=[];
 while(chars.length){
  let cap=0,weight=0;
  while(cap<chars.length&&weight+(chars[cap]==='\n'?16:1)<=limit){weight+=chars[cap]==='\n'?16:1;cap++;}
  if(cap===chars.length)break;
  let end=cap;
  for(let i=cap-1;i>=Math.floor(cap*.5);i--)if(/[。！？!?\n、]/.test(chars[i])){end=i+1;break;}
  while(end<chars.length&&/[、。，．！？!?：；）】』」〉》…ー]/.test(chars[end]))end++;
  pages.push(chars.splice(0,end).join(''));
 }
 if(chars.length||!pages.length)pages.push(chars.join(''));
 return pages;
}
