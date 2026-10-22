// Foreground shapes traced on the existing 1672×941 illustration.
// These are Canvas clipping paths, not replacement artwork. Rail openings stay open.
const SOURCE_WIDTH = 1672, SOURCE_HEIGHT = 941;
const box = (x,y,w,h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
function hallwayRails(top,bottom) {
  const shapes=[box(351,top,942,7),box(351,bottom-5,942,7),box(351,bottom+2,942,21)];
  // Centers of the individual vertical bars in the source image.
  const bars=[355,369,382,395,408,422,436,450,464,478,494,509,524,540,555,570,585,600,615,631,645,659,676,692,705,719,732,746,760,773,787,801,818,835,851,867,883,899,914,929,944,959,974,988,1001,1017,1031,1045,1059,1072,1085,1097,1112,1127,1142,1157,1172,1187,1203,1217,1231,1246,1262,1272,1285];
  for(const x of bars)shapes.push(box(x-1,top+7,3,bottom-top-12));
  // Heavy structural posts are wider than the decorative bars.
  for(const x of [354,687,984,1267])shapes.push(box(x-4,top,8,bottom-top+24));
  return shapes;
}
export const EXTERIOR_OCCLUDERS = {
  upper: hallwayRails(449,516),
  lower: hallwayRails(684,749),
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
    [[280,339],[330,339],[344,350],[344,631],[335,641],[280,641],[272,632],[272,351]]
  ],
  bulletin: [
    // Bulletin board and its two supporting legs.
    box(1255,675,135,122),box(1261,797,12,57),box(1375,797,12,57)
  ]
};
// Display-only calibration keeps existing journeys and their saved timings intact.
// The illustrated corridor floor is below the old logical walking baseline.
export function exteriorFeet(position) {
  if(!position||position.zone==='room'||position.zone==='away')return position;
  const offset=position.y<=300?8:position.y<=440?8-(position.y-300)/140:7*Math.max(0,(513-position.y)/73);
  return {...position,y:position.y+offset};
}
export function foregroundKeys(position) {
  if(position.zone==='away'||position.zone==='room')return [];
  const keys=['signs'];
  // Compare feet with the board's ground contact, not the walking direction.
  // Stair/hall traffic passes behind it; the nearest street passes in front.
  if(position.y<854*562.5/SOURCE_HEIGHT)keys.push('bulletin');
  if(position.zone==='hall')keys.push(position.y<340?'upper':'lower');
  if(position.zone==='stairs')keys.push('upper','lower','stairs');
  return keys;
}
const foregroundPathCache = new Map();
export function drawExteriorForeground(ctx,image,position,darkness=0) {
  const keys=foregroundKeys(position);
  if(!image||!keys.length)return;
  ctx.save();
  ctx.scale(1000/SOURCE_WIDTH,562.5/SOURCE_HEIGHT);
  if (typeof Path2D !== 'undefined') {
    const cacheKey = keys.join('|');
    let path = foregroundPathCache.get(cacheKey);
    if (!path) {
      path = new Path2D();
      for (const key of keys) for (const polygon of EXTERIOR_OCCLUDERS[key]) {
        path.moveTo(...polygon[0]);
        for (let i=1;i<polygon.length;i++) path.lineTo(...polygon[i]);
        path.closePath();
      }
      foregroundPathCache.set(cacheKey,path);
    }
    ctx.clip(path);
  } else {
    // Test contexts and browsers without Path2D retain the identical traced outline.
    ctx.beginPath();
    for (const key of keys) for (const polygon of EXTERIOR_OCCLUDERS[key]) {
      ctx.moveTo(...polygon[0]);
      for (let i=1;i<polygon.length;i++) ctx.lineTo(...polygon[i]);
      ctx.closePath();
    }
    ctx.clip();
  }
  ctx.drawImage(image,0,0,SOURCE_WIDTH,SOURCE_HEIGHT);
  // Match the same night tint applied to the background, preventing bright rails at night.
  if(darkness>0){ctx.fillStyle=`rgba(16,27,49,${darkness})`;ctx.fillRect(0,0,SOURCE_WIDTH,SOURCE_HEIGHT);}
  ctx.restore();
}
