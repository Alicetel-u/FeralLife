export const WALK_SPEED = 430;
export const OUTINGS = {
  cat: { hour: 18, duration: 2, reason: 'コンビニで買い出し', side: 'right' },
  rabbit: { hour: 9, duration: 6, reason: '仕事と寄り道の買い物', side: 'left' },
  fox: { hour: 11, duration: 3, reason: '仕入れという名の商談', side: 'right' },
  wolf: { hour: 20, duration: 2, reason: '夜の散歩', side: 'left' },
  bear: { hour: 7, duration: 7, reason: '配送の仕事', side: 'right' },
  mouse: { hour: 16, duration: 2, reason: '街の拾い物探し', side: 'left' },
  tanuki: { hour: 13, duration: 3, reason: '今日の勝負', side: 'right' }
};
export function exteriorRoomBounds(room) { return { x: 218 + ((room % 100) - 1) * 182, y: room >= 200 ? 191 : 331, w: 173, h: 113 }; }
const point = (x, y, zone, room = null) => ({ x, y, zone, room });
export function homeSpot(room, place = 'table') {
  const b = exteriorRoomBounds(room);
  const spots = { table: [82, 104], bed: [48, 92], window: [65, 94], fridge: [137, 98], tv: [105, 104], center: [55, 105], hall: [113, 108] };
  const [x, y] = spots[place] || spots.table;
  return point(b.x + x, b.y + y, 'room', room);
}
function doorway(room) { const b = exteriorRoomBounds(room); return point(b.x + 113, room >= 200 ? 300 : 440, 'hall', room); }
const upperStair = () => point(777, 300, 'hall', 203);
const landing = () => point(848, 370, 'stairs');
const lowerStair = () => point(777, 440, 'hall', 103);
const street = () => point(815, 513, 'street');
function pathDuration(path) { return path.slice(1).reduce((total, p, i) => total + Math.hypot(p.x - path[i].x, p.y - path[i].y), 0) / WALK_SPEED; }
function reversePath(path) { return [...path].reverse().map(p => ({ ...p })); }
function connectRooms(fromRoom, toRoom, start, end) {
  const path = [start, doorway(fromRoom)];
  if ((fromRoom >= 200) !== (toRoom >= 200)) path.push(...(fromRoom >= 200 ? [upperStair(), landing(), lowerStair()] : [lowerStair(), landing(), upperStair()]));
  path.push(doorway(toRoom), end);
  return path;
}
export function createOuting(resident, hour, start = homeSpot(resident.room)) {
  const plan = OUTINGS[resident.type];
  const path = [start, doorway(resident.room)];
  if (resident.room >= 200) path.push(upperStair(), landing());
  path.push(lowerStair(), street(), point(plan.side === 'left' ? -80 : 1080, 513, 'street'));
  const outward = pathDuration(path), back = reversePath(path);
  return { kind: 'outing', startedAt: hour, arriveAt: hour + outward, returnAt: hour + outward + plan.duration, endsAt: hour + outward + plan.duration + pathDuration(back), reason: plan.reason, path, back, actionAfter: 'idle', returned: false };
}
export function createVisit(resident, hour, start, targetRoom) {
  const path = connectRooms(resident.room, targetRoom, start, homeSpot(targetRoom, 'center'));
  const outward = pathDuration(path), back = reversePath(path);
  return { kind: 'visit', startedAt: hour, arriveAt: hour + outward, returnAt: hour + outward + .6, endsAt: hour + outward + .6 + pathDuration(back), reason: `${targetRoom}号室へ`, path, back, actionAfter: 'idle', returned: false };
}
export function createRoomMove(resident, hour, start, place) {
  const end = homeSpot(resident.room, place);
  const path = start.zone === 'room' && start.room === resident.room ? [start, end] : connectRooms(start.room || resident.room, resident.room, start, end);
  const time = pathDuration(path);
  return { kind: 'room', startedAt: hour, arriveAt: hour + time, returnAt: hour + time, endsAt: hour + time, reason: '', path, back: [], actionAfter: resident.action, returned: false };
}
function samplePath(path, hours) {
  let distance = Math.max(0, hours) * WALK_SPEED;
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1], to = path[i], length = Math.hypot(to.x - from.x, to.y - from.y);
    if (distance < length && length > 0) {
      const t = distance / length;
      const zone = from.zone === 'stairs' || to.zone === 'stairs' ? 'stairs' : from.zone === 'street' || to.zone === 'street' ? 'street' : from.zone === 'room' && t < .8 ? 'room' : to.zone === 'room' && t > .2 ? 'room' : 'hall';
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, zone, room: zone === 'room' ? (from.zone === 'room' ? from.room : to.room) : (t < .5 ? from.room : to.room), direction: to.x < from.x ? -1 : 1, moving: true, phase: 'walking' };
    }
    distance -= length;
  }
  return { ...path.at(-1), direction: 1, moving: false, phase: 'home' };
}
export function sampleJourney(resident, hour, place = 'table') {
  const j = resident.journey;
  if (!j) return { ...homeSpot(resident.room, place), moving: false, direction: 1, phase: 'home' };
  if (hour < j.arriveAt) return { ...samplePath(j.path, hour - j.startedAt), phase: j.kind === 'outing' ? 'outbound' : 'walking' };
  if (hour < j.returnAt) return j.kind === 'outing' ? { ...j.path.at(-1), zone: 'away', room: null, moving: false, direction: 1, phase: 'away' } : { ...j.path.at(-1), moving: false, direction: 1, phase: 'visiting' };
  if (hour < j.endsAt && j.back.length) return { ...samplePath(j.back, hour - j.returnAt), phase: 'returning' };
  return { ...(j.kind === 'room' ? j.path.at(-1) : j.back.at(-1)), moving: false, direction: 1, phase: 'home' };
}
export function motionLabel(resident, hour, fallback) {
  const p = sampleJourney(resident, hour);
  if (resident.journey?.kind === 'outing' && p.phase !== 'home') return p.phase === 'away' ? `外出中 · ${resident.journey.reason}` : p.phase === 'returning' ? 'けもの荘に帰宅中' : p.zone === 'stairs' ? '階段を下りて外出中' : '外出のため移動中';
  if (p.zone === 'stairs') return p.phase === 'returning' ? '階段を通って戻っている' : '階段を上り下りしている';
  if (p.moving && resident.journey?.kind === 'visit') return p.phase === 'returning' ? '自分の部屋へ戻っている' : resident.journey.reason;
  return fallback;
}
export function validJourney(j) {
  if (j == null) return true;
  const validPath = path => Array.isArray(path) && path.length < 20 && path.every(p => p && Number.isFinite(p.x) && Number.isFinite(p.y) && ['room', 'hall', 'stairs', 'street'].includes(p.zone) && (p.room == null || [101,102,103,201,202,203].includes(p.room)));
  return ['room', 'visit', 'outing'].includes(j.kind) && [j.startedAt,j.arriveAt,j.returnAt,j.endsAt].every(Number.isFinite) && j.startedAt <= j.arriveAt && j.arriveAt <= j.returnAt && j.returnAt <= j.endsAt && typeof j.reason === 'string' && validPath(j.path) && j.path.length >= 2 && validPath(j.back) && (j.kind === 'room' || j.back.length >= 2);
}
