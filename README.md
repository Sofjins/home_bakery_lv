# Home Bakery · Marina’s kitchen

A warm, quietly animated kitchen for Marina’s home cooking service in Riga. Three.js renders a layered photographic scene. The camera and furnishings stay fixed; only the recipe book is interactive within the scene.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173. No build step or runtime package installation is needed. Three.js 0.180.0 is vendored with its license. Google Fonts are optional and have system fallbacks.

## Ambient motion

- Slow automatic stirring of vegetable soup, small surface ripples and bubbles, and rising steam.
- A self-moving whisk in a flour-and-batter bowl, with sparse flour particles.
- Gentle localized movement in herbs, leafy greens, dried flowers and linen.
- Soft candle flicker, breathing oven light, subtle reflections on copper and glass, heat shimmer and drifting dust.
- No mouse-driven camera motion, scene panning, dragging, or per-object controls.
- The book opens bilingual Russian/Latvian menu pages. Language and pause controls remain accessible. Reduced-motion preferences pause the scene, and hidden tabs stop advancing animation time.

This is a 2.5D photographic composition, not a reconstructed volumetric room. Vegetation and fabric move through small localized texture distortions. The cooking tools are transparent photographic layers; their tips are occluded by vessel fronts. Original photographic candle flames remain underneath animated illumination.

## Version control

GitHub: https://github.com/Sofjins/home_bakery_lv

- `origin`: the GitHub repository.
- `sites`: the hosting source repository; publishing uses a short-lived credential, never committed.
- `v0.1-interactive`: original draggable prototype.
- `v0.2-ambient`: fixed-camera, automatically animated kitchen.

Website files are in `dist/`; bilingual content is in `dist/book-data.js`, motion in `dist/kitchen.js`, and styling in `dist/style.css`. `.openai/hosting.json` identifies the existing private hosted Site. It contains no credentials.

## Verification

`node --check dist/kitchen.js` and `node --check dist/book-data.js` check JavaScript syntax. `verify.cjs` performs browser checks for fixed camera and furnishings, automatic utensil motion, book navigation, languages, mobile layout, pause, and reduced motion. It requires Playwright and Chrome; set `PLAYWRIGHT_MODULE`, `CHROME_PATH`, or `PREVIEW_URL` to override their defaults. Screenshots are ignored by Git.

## Assets and content

The source kitchen photograph was supplied by the user. The approved oak tavern, clean backdrop, and transparent prop atlases were created with the built-in image generator. `dist/assets/cooking.png` was generated with this prompt direction: four isolated, photoreal props matching the kitchen’s warm light — copper soup pot, flour/batter bowl, upright wooden spoon, upright whisk — on a transparent 2×2 atlas. No generated dish image is presented as a photograph of Marina’s actual cooking. The menu is illustrative of her range; Latvian text should receive a native-speaker editorial review before public launch.
