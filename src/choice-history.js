// Failed outcomes are separate from answer history: success must remain available.
export function failedChoiceKeys(state){
 const a=state?.actOne;if(!a)return new Set();
 const failed=new Set(a.failedChoices||[]);
 for(const failure of a.memory||[]){
  if(failure.startsWith('duel-'))continue; // Final balance is not a failed individual answer.
  if(['bag-guarantee','ash-laundry','ash-wind'].includes(failure))continue; // First-night and later romance endings share this old id.
  const at=failure.indexOf('-');if(at>0)failed.add(failure.slice(0,at)+':'+failure.slice(at+1));
 }
 if(a.chapter===2&&a.failure==='bag-guarantee'&&a.status==='bad'&&a.attempt>1)failed.add('bag:guarantee');
 return failed;
}
