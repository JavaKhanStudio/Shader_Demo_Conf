export default {
  name: 'Adding Time',
  explanationFR: `Un uniform est une valeur globale, la même pour chaque pixel pendant une exécution, et qui peut être injectée avec Javascript.

- Le code Javascript ci-dessous écrit le temps écoulé (en secondes) dans l'uniform time à chaque image.
- sin(time * speed) oscille entre -1.0 et 1.0 ; il pilote le vert.
- Le rouge suit toujours vUv.x.
La couleur change à chaque image, sans rien recalculer côté Javascript.`,
  explanationENG: `A uniform is a global value, the same for every pixel during one run, and it can be injected from Javascript.

- The Javascript code below writes the elapsed time (in seconds) into the time uniform every frame.
- sin(time * speed) swings between -1.0 and 1.0; it drives the green.
- Red still follows vUv.x.
The colour changes every frame with nothing recomputed in Javascript.`,
  codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/04_AddingTime.js",
  material: new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0.0},
      speed: {value: 0.8}
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    uniform float time;
    uniform float speed;
    
    void main() {
      // Create a color that changes over time
      float animatedValue = sin(time * speed);  // Oscillates between -1 and 1
      vec3 color = vec3(vUv.x, animatedValue, 0.0); 

      // Display the color
      gl_FragColor = vec4(color, 1.0);
    }
  `
  })
}
