# Spatial CSS portal test suite

Twelve standalone feature demos for the experimental native browser. Start at
[index.html](index.html). Everything is local: HTML, CSS, JavaScript, and four
copied USDZ packages. No polyfill, npm install, CDN, or build step is required.

## Open the suite

```sh
cd /home/cabanier/spatial-css-tests
python3 serve.py
```

Open **http://127.0.0.1:18881/index.html**. `serve.py` serves USDZ as
`model/vnd.usdz+zip` and JavaScript as `text/javascript`. Native model APIs need
a secure context; localhost qualifies. A headset can use ADB reverse for this
port and open the same localhost URL.

The browser needs these experiments merged into its existing flags:

```text
--enable-features=CSSSpatialBackPortal,ModelElement,MetaHeadTrackedStereo
--enable-blink-features=CSSSpatialBackPortal,ModelElement
```

The pages show actual support and asset loading status. They remain readable
in a browser without the experiment, but their flat fallback does not test
depth, head tracking, or mixed model rendering.

## Feature checklist

| Test | Page | Features under test |
| --- | --- | --- |
| 01 | [A window into HTML and a teapot](01-back-portal.html) | spatial: portal, position: spatial-absolute, Glass vs. back context, stagemode: orbit |
| 02 | [Shared depth: HTML in front and behind](02-depth-occlusion.html) | inset-front, HTML / mesh occlusion, Shared depth buffer, stagemode: orbit |
| 03 | [Hover circles with X, Y, and Z spins](03-hover-axes.html) | transform-style: preserve-3d, rotate3d(), Native hover |
| 04 | [Labels and rulers attached to a model](04-model-anchors.html) | anchor-name / position-anchor, position-area: … / front, anchor-size(width / depth), stagemode: orbit |
| 05 | [Container axes compared with anchor axes](05-anchor-context.html) | position-context: container, position-context: anchor, Transformed HTML anchors |
| 06 | [Origins, depth edges, and Z alignment](06-origins-and-depth.html) | offset-anchor / anchor-origin, anchor(front / back / origin), z-align-self, stagemode: orbit |
| 07 | [Stage fitting, automatic bounds, and resizing](07-stage-fit.html) | portal-stage, portal-transform: auto, Automatic stage measurement, stagemode: orbit |
| 08 | [A spinning nested stage that expands on hover](08-nested-stages.html) | Nested spatial: portal, Shared outer scene, Hover expansion by 30 CSS cm |
| 09 | [Native HTML controls at different depths](09-native-input.html) | Depth-aware picking, Native focus / activation, Retained HTML repaint, stagemode: orbit |
| 10 | [Animated USDZ models with HTML attachments](10-usdz-animation.html) | USDZ scene loading, Embedded model animation, Root-bound HTML anchors, stagemode: orbit |
| 11 | [Clipping at the glass plane](11-portal-clipping.html) | Back boundary at z ≤ 0, Tilted HTML planes, Mesh / aperture clipping, stagemode: orbit |
| 12 | [Portal airshow: a flight through HTML](12-airshow.html) | Multiple USDZ assets, Animated 3D occlusion, Model anchors + HTML depth, stagemode: orbit |

Each page has a visible feature label, instructions, expected visual behavior,
and an expandable **CSS under test** section showing that page's actual CSS.

## Orbit controls

Models with fixed element positions use native `stagemode="orbit"`. Drag a
model horizontally or vertically to turn it. The cursor changes to a grab
hand. This includes the teapots, the stationary chameleon, and the models in
the animation comparison; their embedded animation can continue while orbiting.

The model-anchor test starts in orbit mode. Uncheck **Orbit controls** to use
the entity-scale slider, then check it again to resume native orbit. Native
orbit owns the entity transform, so the editor explicitly switches to `none`
while changing that transform. The flying biplane and the model inside the
continuously rotating nested stage use their scene animation controls.

All 13 HTML files are formatted with Prettier using two-space indentation and
a 100-column print width, including their embedded CSS and JavaScript.


### Large multi-asset scene

[12-airshow.html](12-airshow.html) uses `toy_biplane_realistic.usdz`,
`teapot.usdz`, and `chameleon_anim_mtl_variant.usdz`. The biplane flies an
18-second oval with a root depth between 230px and 1090px. The central opaque
HTML sign is 530px deep; rear signs are 860px deep and a near apron is 190px
deep. The plane's depth and position really change; DOM order stays fixed.

**Near pass** freezes the plane in front of the central sign. **Far pass**
freezes it behind the sign. **Resume motion** continues the lap. The phase
slider allows repeatable occlusion checks. Embedded model animation and HTML
anchor labels are retained while the model moves through the scene.

## Assets

Copied unchanged from `/home/cabanier/model-polyfill/public/models`:

- `models/teapot.usdz` — basic model for the focused feature tests.
- `models/toy_biplane_realistic.usdz` — flying model and embedded animation.
- `models/chameleon_anim_mtl_variant.usdz` — complex animated scene with its
  USDZ-selected material configuration.
- `models/robot.usdz` — another animated model in the animation comparison.

Sizes and SHA-256 digests are in [source-manifest.json](models/source-manifest.json).
The source assets have not been modified or converted. Model animations use
the native model API; spatial placement uses the implemented CSS properties.

## Scope and interpretation

- Back portals and opaque model geometry are the implemented subset.
- Model anchor queries use root authored bounds, fit, and entity/orbit
  transforms. Internal glTF/USD nodes, animated bone bounds, marker anchors,
  and material-variant selectors are outside these demos.
- Head tracking changes the private view projection, not CSS anchor queries.
- Every model remains behind the glass in the airshow. Clipping test 11
  deliberately lets geometry intersect the boundary to show its back half.
- Test 08 uses `30cm` in authored CSS units. The portal's uniform fitting
  determines the displayed scale; this does not promise a 30cm physical
  displacement in the headset.
- Hover uses fixed regions, and focused tiles can also animate. Reduced-motion
  preferences pause motion initially; the motion button allows explicit resume.

## Validation

- Final HTML structure, unique IDs, links, asset hashes, JavaScript syntax,
  orbit markup, and served-byte checks passed. See
  [static.json](validation/static.json).
- All 13 HTML files passed the formatting check:

  ```sh
  prettier --check --print-width 100 --html-whitespace-sensitivity ignore *.html
  ```

- The first native Quest pass checked all twelve demos, all four USDZ assets,
  X/Y/Z hover, anchor resizing, native form activation, model animation, and
  near/far biplane occlusion. See [native.json](validation/native.json) and
  [native.log](validation/native.log). This run preceded the final framing,
  orbit, and formatting edits; its captures are retained for reference.
- A subsequent native attempt stopped before running when its browser target
  had closed. See [changed-target.log](validation/changed-target.log).
- Controller orbit drags and physical binocular/head-motion verification
  have not been performed. A page screenshot does not establish those checks.
