// Foreground shapes traced on the existing 1672×941 illustration.
// These are Canvas clipping paths, not replacement artwork. Rail openings stay open.
const SOURCE_WIDTH = 1672, SOURCE_HEIGHT = 941;
const box = (x,y,w,h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
function hallwayRails(top,bottom) {
  const shapes=[box(351,top,942,7),box(351,bottom-5,942,7),box(351,bottom+2,942,21)];
  // Centers of the individual vertical bars in the source image.
  const bars=[355,373,394,414,435,456,478,499,521,542,563,585,605,627,648,669,690,711,732,754,776,797,818,840,861,883,904,925,947,969,990,1012,1034,1055,1077,1098,1120,1141,1163,1184,1205,1226,1247,1269,1290];
  for(const x of bars)shapes.push(box(x-2,top+7,5,bottom-top-12));
  // Heavy structural posts are wider than the decorative bars.
  for(const x of [354,687,984,1267])shapes.push(box(x-4,top,8,bottom-top+24));
  return shapes;
}
export const EXTERIOR_OCCLUDERS = {
  upper: hallwayRails(449,516),
  lower: hallwayRails(682,749),
  stairs: [
    [[1288,450],[1294,450],[1388,545],[1388,554]], // upper diagonal handrail
    [[1291,507],[1295,516],[1384,609],[1384,600]], // lower diagonal edge
    ...[1300,1318,1336,1354,1372].map(x=>box(x,461+(x-1300),5,54)),
    box(1384,544,63,7),box(1384,607,68,23),
    ...[1387,1405,1425,1445].map(x=>box(x,551,5,57)),
    [[1294,683],[1386,610],[1388,618],[1298,693]], // descending flight
    [[1294,739],[1386,664],[1386,675],[1294,751]],
    ...[1300,1318,1336,1354,1372].map(x=>box(x,679-(x-1300)*.8,5,55))
  ],
  signs: [
    // Illuminated vertical apartment sign, including its dark frame.
    [[280,339],[330,339],[344,350],[344,631],[335,641],[280,641],[272,632],[272,351]],
    // Bulletin board and its two supporting legs.
    box(1255,675,135,122),box(1261,797,12,57),box(1375,797,12,57)
  ]
};
export function foregroundKeys(position) {
  if(position.zone==='away'||position.zone==='room')return [];
  const keys=['signs'];
  if(position.zone==='hall')keys.push(position.y<340?'upper':'lower');
  if(position.zone==='stairs')keys.push('upper','lower','stairs');
  // The street is in front of the hallway rails, but passes behind the bulletin board.
  return keys;
}
export function drawExteriorForeground(ctx,image,position,darkness=0) {
  const keys=foregroundKeys(position);
  if(!image||!keys.length)return;
  ctx.save();
  ctx.scale(1000/SOURCE_WIDTH,562.5/SOURCE_HEIGHT);
  ctx.beginPath();
  for(const key of keys)for(const polygon of EXTERIOR_OCCLUDERS[key]) {
    ctx.moveTo(...polygon[0]);for(const point of polygon.slice(1))ctx.lineTo(...point);ctx.closePath();
  }
  ctx.clip();
  ctx.drawImage(image,0,0,SOURCE_WIDTH,SOURCE_HEIGHT);
  // Match the same night tint applied to the background, preventing bright rails at night.
  if(darkness>0){ctx.fillStyle=`rgba(16,27,49,${darkness})`;ctx.fillRect(0,0,SOURCE_WIDTH,SOURCE_HEIGHT);}
  ctx.restore();
}
