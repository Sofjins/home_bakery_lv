# Home Bakery · Marina’s kitchen

A warm, quietly animated kitchen for Marina’s home cooking service in Riga. Three.js renders a layered photographic scene. The camera and furnishings stay fixed; only the recipe book is interactive within the scene.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173. No build step or runtime package installation is needed. Three.js 0.180.0 is vendored with its license. Google Fonts are optional and have system fallbacks.

## Current scene: the marked original

The approved `dist/assets/original.png` photograph is restored without new props. Only the user's marked regions animate:

- Red: left candle, cooker-hood lights, hanging lamp, light among the jars, right candle, and oven glow brighten and dim gently.
- Green: flowers, trailing greenery, small herb plants and other greens move continuously with small localized texture distortions.
- White: three soft, curling wisps of steam rise from the original pie.
- Orange: the wooden hearts sway slightly around their string attachments.

The viewpoint is fixed. There are no hover-driven effects, movable props, cooking utensils, flour particles, dust particles or fabric animation. The previously implemented bilingual book and pause control remain available. Reduced-motion preferences pause the scene.

This is a 2.5D photographic composition. The only rendered scene meshes are the original image and a transparent steam layer. Plant and heart motion and light modulation are confined to masks in the image shader.

## Version control

GitHub: https://github.com/Sofjins/home_bakery_lv

- `origin`: the GitHub repository.
- `sites`: the hosting source repository; publishing uses a short-lived credential, never committed.
- `v0.1-interactive`: original draggable prototype.
- `v0.2-ambient`: fixed-camera, automatically animated kitchen.

Website files are in `dist/`; bilingual content is in `dist/book-data.js`, motion in `dist/kitchen.js`, and styling in `dist/style.css`. `.openai/hosting.json` identifies the existing private hosted Site. It contains no credentials.

## Verification

`node --check dist/kitchen.js` and `node --check dist/book-data.js` check JavaScript syntax. `verify.cjs` compares rendered pixels in each marked region while the pointer is idle, checks an unmarked cabinet stays unchanged, and verifies the fixed camera, book, mobile layout, pause, and reduced motion. It requires Playwright and Chrome; set `PLAYWRIGHT_MODULE`, `CHROME_PATH`, or `PREVIEW_URL` to override their defaults. Screenshots are ignored by Git.

## Assets and content

The source kitchen photograph was supplied by the user. The approved oak tavern, clean backdrop, and transparent prop atlases were created with the built-in image generator. `dist/assets/cooking.png` was generated with this prompt direction: four isolated, photoreal props matching the kitchen’s warm light — copper soup pot, flour/batter bowl, upright wooden spoon, upright whisk — on a transparent 2×2 atlas. No generated dish image is presented as a photograph of Marina’s actual cooking. The current scene uses only the approved original photograph; the extra atlases are retained as historical assets and are not loaded. The menu is illustrative of her range; Latvian text should receive a native-speaker editorial review before public launch.
