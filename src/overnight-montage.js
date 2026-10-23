// Presentation time is independent of the story clock; endpoints keep the next scene intact.
export function overnightMontageFrame(kind,startHour,elapsed){
 const sleep=kind==='sleep',endHour=sleep?55:36.65;
 const hold=sleep?1.2:.7,travel=sleep?4.5:6.8,tail=sleep?1.1:.9;
 const time=Math.max(0,elapsed),progress=Math.max(0,Math.min(1,(time-hold)/travel));
 const finished=time>=hold+travel+tail;
 const hour=finished?endHour:Math.min(endHour-.001,startHour+(endHour-startHour)*progress);
 const h=hour%24,night=h>=20||h<5?1:h>=18?(h-18)/2:h<7?(7-h)/2:0;
 const dawn=sleep?Math.max(0,Math.min(1,(time-hold-travel+.35)/tail)):h>=5&&h<13?Math.min(1,(h-5)/2):0;
 const caption=sleep?'……すぅ……すぅ……。':hour<27?'「あと一本だけ見るニャ。」':hour<30?'「……これ、続きが気になるニャ。」':hour<34?'「……もう朝かニャ？ まあいいニャ。」':'「……あれ、もう昼ニャ……？」';
 return {hour,finished,shade:sleep?.12+night*.3:night*.12,dawn,caption};
}
