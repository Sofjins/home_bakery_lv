# Home Bakery · Marina’s kitchen

A warm, quietly animated kitchen for Marina’s home cooking service in Riga. Three.js renders a layered photographic scene. The camera and furnishings stay fixed; only the recipe book is interactive within the scene.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173. No build step or runtime package installation is needed. Three.js 0.180.0 is vendored with its license. Google Fonts are optional and have system fallbacks.

## Current scene: the marked original

The approved `dist/assets/original.png` photograph is restored without new props. Only the user's marked regions animate:

- Red: left candle, cooker-hood lights, hanging lamp, light among the jars, right candle, and oven glow brighten and dim independently. A deeper dusk grade gives the amber light pools more contrast. Candle cores flicker at several speeds, the oven breathes, and warm light reflects onto nearby surfaces.
- Green: flowers, trailing greenery, small herb plants and other greens move continuously with stronger, layered gusts confined to their original regions.
- White: three soft, curling wisps of steam rise from the original pie.
- Orange: the wooden hearts sway slightly around their string attachments.

The viewpoint is fixed. There are no hover-driven effects, movable props, cooking utensils, flour particles, dust particles or fabric animation. The bilingual book has layered page edges, curved paper shading, a deeper binding gutter, and printed front/back faces during forward and backward page turns. Rounded, labeled navigation buttons have a minimum 60px touch height. The open book has a slight perspective, a sewn-cover edge, darker paper curvature and an eased lifting page turn; horizontal swipes also turn pages on touchscreens. The visible pause control is removed; reduced-motion preferences still pause the scene.

This is a 2.5D photographic composition. The only rendered scene meshes are the original image and a transparent steam layer. Plant and heart motion and light modulation are confined to masks in the image shader.

## Version control

GitHub: https://github.com/Sofjins/home_bakery_lv

- `origin`: the GitHub repository.
- `sites`: the hosting source repository; publishing uses a short-lived credential, never committed.
- `v0.1-interactive`: original draggable prototype.
- `v0.2-ambient`: fixed-camera, automatically animated kitchen.

Website files are in `dist/`; bilingual content is in `dist/book-data.js`, motion in `dist/kitchen.js`, and styling in `dist/style.css`. `.openai/hosting.json` identifies the existing private hosted Site. It contains no credentials.

## Verification

`node --check dist/kitchen.js` and `node --check dist/book-data.js` check JavaScript syntax. `verify.cjs` compares rendered pixels in each marked region while the pointer is idle, checks an unmarked cabinet stays unchanged, and verifies the fixed camera, book, mobile layout, and reduced motion. It requires Playwright and Chrome; set `PLAYWRIGHT_MODULE`, `CHROME_PATH`, or `PREVIEW_URL` to override their defaults. Screenshots are ignored by Git.

## Assets and content

The source kitchen photograph was supplied by the user. The approved oak tavern, clean backdrop, and transparent prop atlases were created with the built-in image generator. `dist/assets/cooking.png` was generated with this prompt direction: four isolated, photoreal props matching the kitchen’s warm light — copper soup pot, flour/batter bowl, upright wooden spoon, upright whisk — on a transparent 2×2 atlas. No generated dish image is presented as a photograph of Marina’s actual cooking. The current scene uses only the approved original photograph; the extra atlases are retained as historical assets and are not loaded. The menu is illustrative of her range; Latvian text should receive a native-speaker editorial review before public launch.

## Photographic recipe book

The open book now uses `dist/assets/recipe-book.png`, generated with the built-in image tool, for worn leather, paper grain, uneven edges and binding. Live HTML supplies all menu text. `dist/page-turn.js` bends eighteen strips of each printed leaf; each strip displays only its correct face. Face lighting is kept outside the 3D transform hierarchy to prevent the mirrored text caused by ancestor filters. Closing, resizing or changing language finishes an active turn cleanly.

Run `PLAYWRIGHT_MODULE=/private/tmp/marina-kitchen-deps/node_modules/playwright node verify-book.cjs` against the local preview on port 4183 to check all spreads in both languages, intermediate front/back visibility, mobile text bounds, interrupted turns and reduced motion. Generation direction is recorded in `book-material-prompt.md`.

## Reading and phone layouts

Book content is centered on both pages. The locally bundled Literata font supplies Cyrillic and Latvian text; Caveat supplies handwritten notes. Their OFL licenses live beside the font files. The final spread is an invitation to discuss a menu through Instagram. The header’s “Обо мне” / “Par mani” opens Marina’s introduction within the book.

Portrait phones show one physical page at a time; swipe or use arrows to navigate. Landscape shows the two-page spread. The same spread and page side survive rotation. A dedicated portrait kitchen asset keeps the pie and book fully visible, with separately mapped light, foliage, heart and steam animation. The closed-book hit area and shimmer follow its perspective outline in each scene. No rotation prompt is required.

Portrait asset `dist/assets/kitchen-portrait.png` was produced with the built-in image-generation tool, using `original.png` as the reference: recompose the same oak kitchen vertically, preserving its furnishings, with the quiche at lower left, closed book at lower right, warm candle and oven glow, quiet space at the top for navigation, and no baked-in text or steam. The original landscape scene remains the desktop and landscape-phone view.
