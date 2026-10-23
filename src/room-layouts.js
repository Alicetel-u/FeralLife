// Furniture coordinates use the existing 173 x 113 room plane, never image pixels.
export const ROOM_SPOTS = {
  table:[82,104],bed:[34,81],window:[65,94],fridge:[137,98],tv:[105,104],center:[55,105],hall:[113,108]
};
export const ROOM_LAYOUTS = {
  cat:{spots:ROOM_SPOTS,screen:[111,42,26,17],window:[57,12,45,40],bed:[0,48,71,41],table:[64,80,40,19],fridge:[145,33,23,46]},
  hostess:{spots:ROOM_SPOTS,screen:[111,42,26,17],window:[57,12,45,40],bed:[0,49,71,40],table:[64,80,40,19],fridge:[145,33,23,46],vanity:[24,32,31,25]}
};
