export function assertSpokenDuration(text,seconds){
 const letters=String(text).match(/[\p{L}\p{N}]/gu)||[];
 if(!Number.isFinite(seconds)||seconds<=0)throw Error('Invalid recording duration');
 // Short gasps and silence are intentional. A full sentence cannot fit in half a second.
 if(letters.length>=6&&seconds<.5)throw Error('Recording is too short for the spoken sentence: '+seconds+' seconds');
}
