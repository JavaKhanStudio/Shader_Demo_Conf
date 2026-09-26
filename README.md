# Shader Shop — live demos of the talk

Companion site of the talk **« Shaders : pour des effets hallucinants, même sur le web »**
by Simon Bédard, given at BDX I/O 2024 and Devoxx (talk in French, site in English).
Every shader from the slides runs live in the browser, with its GLSL code next to it.

- Live: https://javakhanstudio.github.io/Shader_Demo_Conf/
- Slides: [ThreeJS_Shader.pdf](./ThreeJS_Shader.pdf) (FR), also on
  [Google Slides](https://docs.google.com/presentation/d/15no5I2cuXQd_9M60ibThVRHyi7d7-ZWDqfJ1n7zvBf4/edit?usp=sharing)

## Pages

| Page | Shows |
|---|---|
| `index.html` — Explanations | The lesson step by step: colour, time, textures, perspective, mouse. `?lang=FR` or `?lang=ENG` picks the language of the explanations. |
| `galleryExtern.html` — Extern | Shaders by other authors, credited. |
| `galleryAI.html` — AI | Shaders written by AI models (GPT, Claude, Gemini, Mistral, Grok, DeepSeek). |
| `galleryStyle.html` — Style | One shader per visual style: cyberpunk, retro pixel, organic… |
| `galleryToApply.html` — Applied | Shaders applied to images. |
| `explicationSounds.html` — Sounds | A shader driven by your microphone. |

## Run it locally

No build, no dependencies (three.js and the fonts come from CDNs). From the repository root:

```sh
python3 -m http.server 8000
```

then open http://localhost:8000/. It must be served over HTTP: the header and footer
(`parts/*.html`) are loaded with `fetch()`, which fails from `file://`.

## Add a shader

Each shader is one file exporting a `THREE.ShaderMaterial`, in the folder of the page that
shows it. A page shows only what its folder's list imports:

| Page | Folder (`js/…`) | List |
|---|---|---|
| AI | `aiMadeShaderMaterials/` | `ZShadersList.js` |
| Extern | `externShaderMaterials/` | `ZShadersList.js` |
| Style | `styleShaderMaterials/` | `ZShaderList.js` |
| Applied | `toApplyShaderMaterials/` | `ZtoApplyShaderList.js` |
| Explanations | `explanationsShaderMaterials/` | `explanationList.js` |
| Sounds | `explanationsSoundsShadersMaterials/` | `soundsExplanationList.js` |

1. Copy a file of the same folder as a starting point — the entry shape differs by folder
   (AI and Extern files export `{ name, author, material }`; Style and Applied files export a
   bare material that the list wraps with its name and author).
2. Import it in the folder's list and add it to the exported array.
3. Serve the site and open the page: the new card is there, and the console is clean.

The runtime sets uniforms by name only: `time` (seconds) everywhere, `iTime` and `iResolution`
in the galleries, `mousePosition` on Explanations, `amplitude`, `dominantFrequency` and
`bandAmplitudes` on Sounds. Any other uniform keeps its initial value.
