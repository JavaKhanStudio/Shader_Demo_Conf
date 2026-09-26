"""Write explanationFR / explanationENG into each explainer step (js/explanationsShaderMaterials/).

Step 1 follows the slides "Le vertex de base" / "Le fragment de base" of ThreeJS_Shader.pdf;
the slides have no page for the later steps, so those are written from each step's shader,
in the slides' vocabulary (uniform injected by Javascript, vec, float, RGB between 0 and 1).
Re-running replaces the two fields in place.
"""
import pathlib, re

DIR = pathlib.Path(__file__).resolve().parent.parent / "js" / "explanationsShaderMaterials"

TEXT = {
"01_Basic.js": (
"""Un shader est un programme dédié au GPU, appliqué indépendamment sur chaque pixel de chaque image.

Vertex (exécuté en premier) :
- Crée un vertex qui couvre à lui seul l'ensemble du plan.
- Prend les coordonnées de texture de ce vertex (uv) et les stocke dans vUv.
- vec4(position, 1.0) : une perspective neutre.
- projectionMatrix * modelViewMatrix adapte l'espace au point de vue de la caméra ; le résultat va dans gl_Position, là où le vertex apparaîtra à l'écran.

Fragment (activé après le vertex) :
- Attrape la position du pixel fournie par le vertex (varying vec2 vUv), entre 0.0 et 1.0.
- vec3(0, 0, 1.0 - vUv.x) : aucun rouge, aucun vert, et un bleu allant de l'absolu (à gauche) au vide (à droite).
- gl_FragColor = vec4(color, 1.0) applique cette couleur sans transparence.""",
"""A shader is a program for the GPU, run independently on every pixel of every frame.

Vertex (runs first):
- Creates a single vertex that covers the whole plane.
- Takes that vertex's texture coordinates (uv) and stores them in vUv.
- vec4(position, 1.0): a neutral perspective.
- projectionMatrix * modelViewMatrix fits the space to the camera's point of view; the result goes into gl_Position, where the vertex appears on screen.

Fragment (runs after the vertex):
- Catches the pixel's position given by the vertex (varying vec2 vUv), between 0.0 and 1.0.
- vec3(0, 0, 1.0 - vUv.x): no red, no green, and a blue going from full (left) to none (right).
- gl_FragColor = vec4(color, 1.0) applies that colour with no transparency."""),

"02_01_SimpleColor.js": (
"""Même vertex, on ne touche qu'au fragment.

Une couleur est un vec3 : Rouge, Vert, Bleu, chacun entre 0.0 et 1.0.
- Le rouge suit vUv.y : nul en bas, plein en haut.
- Le bleu suit 1.0 - vUv.x : plein à gauche, nul à droite.
Chaque pixel reçoit sa propre couleur selon sa position : le dégradé vient de là.""",
"""Same vertex; only the fragment changes.

A colour is a vec3: Red, Green, Blue, each between 0.0 and 1.0.
- Red follows vUv.y: none at the bottom, full at the top.
- Blue follows 1.0 - vUv.x: full on the left, none on the right.
Each pixel gets its own colour from its position: that is where the gradient comes from."""),

"02_02_SomeCondition.js": (
"""Un shader accepte des conditions, comme en Javascript.

- beetweenX et beetweenY sont vrais quand le pixel est entre 0.4 et 0.6 sur l'axe.
- Si les deux sont vrais, le pixel est au centre : il devient noir, vec3(0, 0, 0).
- Sinon il garde le dégradé de l'étape précédente.
Attention au typage fort : 0 n'est pas un float, 0.0 en est un.""",
"""A shader accepts conditions, just like Javascript.

- beetweenX and beetweenY are true when the pixel sits between 0.4 and 0.6 on that axis.
- When both are true the pixel is in the centre: it turns black, vec3(0, 0, 0).
- Otherwise it keeps the previous step's gradient.
Mind the strong typing: 0 is not a float, 0.0 is."""),

"03_Optimisation.js": (
"""Le même carré noir, sans if.

Sur un GPU, un if par pixel coûte cher : les pixels voisins s'exécutent ensemble et doivent attendre les deux branches.
- step(0.4, vUv.x) vaut 0.0 avant 0.4 et 1.0 après ; multiplié par step(vUv.x, 0.6), on obtient 1.0 seulement entre 0.4 et 0.6.
- inRange = inRangeX * inRangeY : 1.0 au centre, 0.0 ailleurs.
- mix(dégradé, noir, inRange) choisit la couleur sans condition.""",
"""The same black square, with no if.

On a GPU an if per pixel is expensive: neighbouring pixels run together and wait for both branches.
- step(0.4, vUv.x) is 0.0 below 0.4 and 1.0 above; multiplied by step(vUv.x, 0.6) it is 1.0 only between 0.4 and 0.6.
- inRange = inRangeX * inRangeY: 1.0 in the centre, 0.0 elsewhere.
- mix(gradient, black, inRange) picks the colour without a condition."""),

"04_01_AddingTime.js": (
"""Un uniform est une valeur globale, la même pour chaque pixel pendant une exécution, et qui peut être injectée avec Javascript.

- Le code Javascript ci-dessous écrit le temps écoulé (en secondes) dans l'uniform time à chaque image.
- sin(time * speed) oscille entre -1.0 et 1.0 ; il pilote le vert.
- Le rouge suit toujours vUv.x.
La couleur change à chaque image, sans rien recalculer côté Javascript.""",
"""A uniform is a global value, the same for every pixel during one run, and it can be injected from Javascript.

- The Javascript code below writes the elapsed time (in seconds) into the time uniform every frame.
- sin(time * speed) swings between -1.0 and 1.0; it drives the green.
- Red still follows vUv.x.
The colour changes every frame with nothing recomputed in Javascript."""),

"04_02_Perpective_AddingTimeVertex.js": (
"""Le temps peut aussi animer le vertex.

Le fragment est celui de l'étape Optimisation ; le vertex change :
- Le 1.0 de vec4(position, 1.0) était la perspective neutre.
- Ici il devient animatedW = 1.0 - 0.33 * sin(time * 0.5).
- La position est divisée par cette valeur : quand elle baisse, le plan grossit ; quand elle monte, il rétrécit.
Tout le plan respire, sans toucher aux couleurs.""",
"""Time can drive the vertex too.

The fragment is the Optimisation step's; the vertex changes:
- The 1.0 in vec4(position, 1.0) was the neutral perspective.
- Here it becomes animatedW = 1.0 - 0.33 * sin(time * 0.5).
- The position is divided by that value: as it drops the plane grows, as it rises the plane shrinks.
The whole plane breathes without touching the colours."""),

"05_UsingTexture.js": (
"""Une image entre dans le shader comme un uniform.

- Le code Javascript ci-dessous charge l'image et la place dans l'uniform uTexture.
- Côté shader, elle est reçue en sampler2D.
- texture2D(uTexture, vUv) lit la couleur de l'image à la position du pixel.
Le pixel prend cette couleur telle quelle : on voit l'image, et on peut maintenant la transformer.""",
"""An image enters the shader as a uniform.

- The Javascript code below loads the image and puts it in the uTexture uniform.
- The shader receives it as a sampler2D.
- texture2D(uTexture, vUv) reads the image's colour at the pixel's position.
The pixel takes that colour as is: the image shows, and can now be transformed."""),

"06_01_ImageGray.js": (
"""Une image en noir et blanc.

- On lit la couleur de l'image avec texture2D.
- La moyenne (r + g + b) / 3.0 donne un gris.
- vec3(grayscale) met ce gris dans le rouge, le vert et le bleu ; color.a garde la transparence d'origine.""",
"""An image in black and white.

- Read the image's colour with texture2D.
- The average (r + g + b) / 3.0 gives a gray.
- vec3(grayscale) puts that gray in red, green and blue; color.a keeps the original transparency."""),

"06_02_ImageParGray.js": (
"""Seulement une partie en gris.

- blueIntensity = color.b - color.r mesure à quel point un pixel est plus bleu que rouge.
- Au-dessus de 0.3 (le ciel, les tons bleus), le pixel passe en gris.
- Les autres pixels gardent leur couleur.
Chaque pixel décide pour lui-même, d'après sa seule couleur.""",
"""Only part of it in gray.

- blueIntensity = color.b - color.r measures how much bluer than red a pixel is.
- Above 0.3 (the sky, the blue tones) the pixel turns gray.
- Every other pixel keeps its colour.
Each pixel decides for itself, from its own colour alone."""),

"06_03_ImageWork.js": (
"""On combine : image, condition et temps.

- Les pixels bleus passent en gris, comme à l'étape précédente.
- Les pixels clairs (r + g + b > 1.5) reçoivent un décalage : shift = sin(time + color.r * 10.0 + vUv.x * 2.0) * 0.2.
- Ce décalage est ajouté au rouge et au bleu, retiré au vert : les zones claires changent de teinte en vague, au fil du temps.""",
"""Putting it together: image, condition and time.

- Blue pixels turn gray, as in the previous step.
- Bright pixels (r + g + b > 1.5) get a shift: shift = sin(time + color.r * 10.0 + vUv.x * 2.0) * 0.2.
- The shift is added to red and blue and taken from green: bright areas change hue in a wave over time."""),

"06_04_ImageWorkInverted.js": (
"""Un seul signe change : > 1.5 devient < 1.5.

Ce sont maintenant les pixels sombres qui ondulent, et les zones claires restent intactes. Un caractère suffit à changer tout l'effet.""",
"""A single sign changes: > 1.5 becomes < 1.5.

Now the dark pixels ripple and the bright areas stay untouched. One character is enough to change the whole effect."""),

"07_01_Mouse.js": (
"""La souris, injectée comme un uniform.

- Le code Javascript ci-dessous convertit la position de la souris sur le canvas en valeurs entre 0.0 et 1.0 et les écrit dans l'uniform mousePosition (un vec2).
- distance(vUv, mousePosition) mesure l'écart entre le pixel et la souris.
- Plus le pixel est loin, plus on lui retire de lumière : un projecteur suit la souris.
Ici la souris est mesurée sur le canvas entier : le projecteur décale un peu par rapport au plan.""",
"""The mouse, injected as a uniform.

- The Javascript code below turns the mouse position on the canvas into values between 0.0 and 1.0 and writes them into the mousePosition uniform (a vec2).
- distance(vUv, mousePosition) measures how far the pixel is from the mouse.
- The farther the pixel, the more light it loses: a spotlight follows the mouse.
Here the mouse is measured on the whole canvas, so the spotlight drifts a little from the plane."""),

"07_02_MousePrecise.js": (
"""Même shader, souris précise.

Le plan ne remplit pas tout le canvas et la caméra a une perspective : la position sur le canvas n'est pas la position sur le plan.
- Le code Javascript ci-dessous lance un rayon (Raycaster) depuis la caméra à travers la souris.
- Le point où ce rayon touche le plan est ramené entre 0.0 et 1.0, dans le même espace que vUv.
Le projecteur tombe maintenant exactement sous la souris.""",
"""Same shader, precise mouse.

The plane does not fill the canvas and the camera has perspective: a position on the canvas is not a position on the plane.
- The Javascript code below casts a ray (Raycaster) from the camera through the mouse.
- The point where that ray hits the plane is brought back between 0.0 and 1.0, the same space as vUv.
The spotlight now lands exactly under the mouse."""),

"extra_functions.js": (
"""Les fonctions trigonométriques du GLSL, dessinées.

Le plan est coupé en six bandes : sin (rouge), cos (vert), tan (bleu), puis leurs inverses 1/sin (jaune), 1/cos (magenta), 1/tan (cyan).
- x avance avec time : les courbes défilent.
- plotLine() allume un pixel quand il est proche de la courbe, avec smoothstep pour un bord doux.
- mix() pose la couleur de la courbe sur le fond blanc ; mod() trace les séparations noires.
sin et cos sont les outils de base de toute animation dans un shader.""",
"""GLSL's trigonometric functions, drawn.

The plane is cut into six bands: sin (red), cos (green), tan (blue), then their inverses 1/sin (yellow), 1/cos (magenta), 1/tan (cyan).
- x moves with time: the curves scroll.
- plotLine() lights a pixel when it is close to the curve, with smoothstep for a soft edge.
- mix() lays the curve's colour on the white background; mod() draws the black separators.
sin and cos are the basic tools of every animation in a shader."""),

"extra_TooMuch.js": (
"""Trop, c'est trop.

On reprend l'image travaillée et on déplace aussi l'endroit où on la lit :
- uvOffset décale vUv selon sin(time * 10.0) et cos(time * 10.0) : l'image tremble.
- Les zones claires et les zones sombres tremblent en sens opposé et changent de teinte en sens opposé.
Tout est possible, mais tout n'est pas une bonne idée.""",
"""Too much is too much.

Take the worked image and also move where it is read:
- uvOffset shifts vUv by sin(time * 10.0) and cos(time * 10.0): the image shakes.
- Bright and dark areas shake in opposite directions and shift hue in opposite directions.
Anything is possible; not everything is a good idea."""),
}

def js(s):
    assert "`" not in s and "${" not in s
    return "`" + s.replace("\\", "\\\\") + "`"

for name, (fr, eng) in TEXT.items():
    path = DIR / name
    src = path.read_text()
    new, n = re.subn(r"explanationFR: (?:''|`[^`]*`),(\s*)explanationENG: (?:''|`[^`]*`),",
                     lambda m: f"explanationFR: {js(fr)},{m.group(1)}explanationENG: {js(eng)},", src)
    assert n == 1, (name, n)
    path.write_text(new)
    print("wrote", name)

listed = set(re.findall(r"from '\./([^']+)'", (DIR / "explanationList.js").read_text()))
assert listed == set(TEXT), listed ^ set(TEXT)
