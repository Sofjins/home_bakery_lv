# Marina’s interactive oak kitchen

Static Three.js scene rendered over the approved AI-generated kitchen photograph. Matter.js handles suspended objects, the linked garland, pointer constraints and tabletop collisions. This is a layered 2.5D scene, not a fully reconstructed 3D room.

Serve `dist/` over HTTP. No build or CDN JavaScript is required. Three.js 0.180.0 and Matter.js 0.20.0 are vendored with their licenses; optional Google Fonts have local system fallbacks.

Interactions: drag pans, mugs, hearts, lamp, book and quiche; tap book to open; tap lamp/candles/oven to vary their light; drag an empty area to pan on narrow screens. Hints expose keyboard buttons; arrow keys nudge focused objects. Sound is opt-in. Reduced motion starts the scene paused. Reset restores object positions. Russian and Latvian content is included; Latvian copy should receive a native-speaker editorial review before a public launch.

Physics runs at a bounded fixed 60 Hz step, pauses on hidden tabs and while reading the book, and caps rendering pixel ratio. Tabletop objects move in a 2D plane with simulated friction; hanging props have gravity and rotational inertia. Background objects remain part of a photograph. Candle controls change animated light; their original photographic flames remain in the source plate.

Images: approved oak tavern concept plus generated clean plate and transparent object atlas, created using the built-in image generator. Prompt direction: preserve the specific kitchen and remove movable props for the clean plate; isolate six matching photoreal props on a transparent atlas. Source photo supplied by the user.

References: https://threejs.org/docs/pages/OrthographicCamera.html and https://brm.io/matter-js/docs/classes/Constraint.html.
