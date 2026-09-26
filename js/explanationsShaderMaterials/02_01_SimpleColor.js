export default {
    name: 'Some Color',
    explanationFR: `Même vertex, on ne touche qu'au fragment.

Une couleur est un vec3 : Rouge, Vert, Bleu, chacun entre 0.0 et 1.0.
- Le rouge suit vUv.y : nul en bas, plein en haut.
- Le bleu suit 1.0 - vUv.x : plein à gauche, nul à droite.
Chaque pixel reçoit sa propre couleur selon sa position : le dégradé vient de là.`,
    explanationENG: `Same vertex; only the fragment changes.

A colour is a vec3: Red, Green, Blue, each between 0.0 and 1.0.
- Red follows vUv.y: none at the bottom, full at the top.
- Blue follows 1.0 - vUv.x: full on the left, none on the right.
Each pixel gets its own colour from its position: that is where the gradient comes from.`,
    material: new THREE.ShaderMaterial({
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
          vec3 color;

          color = vec3(vUv.y, 0, 1.0 - vUv.x);

          gl_FragColor = vec4(color, 1.0);
        }
      `
    })
}