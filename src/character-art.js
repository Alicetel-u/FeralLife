// Add future approved character art here; unregistered residents retain their draft sprites.
export const SCENE_ART = { src: 'assets/apartments.png', image: null };
export const CHARACTER_ART = {
  cat: { src: 'assets/characters/cat/idle.png', portraitSrc: 'assets/characters/cat/portrait.png', displayHeight: 44, origin: [48, 126], image: null, portrait: null }
};

export async function loadCharacterArt() {
  const load = src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => { console.warn('Character image could not load:', src); resolve(null); };
    image.src = src;
  });
  await Promise.all([load(SCENE_ART.src).then(image => { SCENE_ART.image = image; }), ...Object.values(CHARACTER_ART).map(async art => {
    [art.image, art.portrait] = await Promise.all([load(art.src), load(art.portraitSrc)]);
  })]);
}
