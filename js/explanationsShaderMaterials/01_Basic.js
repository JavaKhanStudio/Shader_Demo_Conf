export default {
    name: 'Basic concepts',
    explanationFR: `Un shader est un programme dédié au GPU, appliqué indépendamment sur chaque pixel de chaque image.

Vertex (exécuté en premier) :
- Crée un vertex qui couvre à lui seul l'ensemble du plan.
- Prend les coordonnées de texture de ce vertex (uv) et les stocke dans vUv.
- vec4(position, 1.0) : une perspective neutre.
- projectionMatrix * modelViewMatrix adapte l'espace au point de vue de la caméra ; le résultat va dans gl_Position, là où le vertex apparaîtra à l'écran.

Fragment (activé après le vertex) :
- Attrape la position du pixel fournie par le vertex (varying vec2 vUv), entre 0.0 et 1.0.
- vec3(0, 0, 1.0 - vUv.x) : aucun rouge, aucun vert, et un bleu allant de l'absolu (à gauche) au vide (à droite).
- gl_FragColor = vec4(color, 1.0) applique cette couleur sans transparence.`,
    explanationENG: `A shader is a program for the GPU, run independently on every pixel of every frame.

Vertex (runs first):
- Creates a single vertex that covers the whole plane.
- Takes that vertex's texture coordinates (uv) and stores them in vUv.
- vec4(position, 1.0): a neutral perspective.
- projectionMatrix * modelViewMatrix fits the space to the camera's point of view; the result goes into gl_Position, where the vertex appears on screen.

Fragment (runs after the vertex):
- Catches the pixel's position given by the vertex (varying vec2 vUv), between 0.0 and 1.0.
- vec3(0, 0, 1.0 - vUv.x): no red, no green, and a blue going from full (left) to none (right).
- gl_FragColor = vec4(color, 1.0) applies that colour with no transparency.`,
    codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/01_Basic.js",
    material : new THREE.ShaderMaterial({
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: `
        varying vec2 vUv;
        void main() {
          vec3 color = vec3(0, 0, 1.0 - vUv.x);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    })
};
