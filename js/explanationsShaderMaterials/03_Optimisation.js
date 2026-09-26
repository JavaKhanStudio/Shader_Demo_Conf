export default {
    name: 'Optimisation',
    explanationFR: `Le même carré noir, sans if.

Sur un GPU, un if par pixel coûte cher : les pixels voisins s'exécutent ensemble et doivent attendre les deux branches.
- step(0.4, vUv.x) vaut 0.0 avant 0.4 et 1.0 après ; multiplié par step(vUv.x, 0.6), on obtient 1.0 seulement entre 0.4 et 0.6.
- inRange = inRangeX * inRangeY : 1.0 au centre, 0.0 ailleurs.
- mix(dégradé, noir, inRange) choisit la couleur sans condition.`,
    explanationENG: `The same black square, with no if.

On a GPU an if per pixel is expensive: neighbouring pixels run together and wait for both branches.
- step(0.4, vUv.x) is 0.0 below 0.4 and 1.0 above; multiplied by step(vUv.x, 0.6) it is 1.0 only between 0.4 and 0.6.
- inRange = inRangeX * inRangeY: 1.0 in the centre, 0.0 elsewhere.
- mix(gradient, black, inRange) picks the colour without a condition.`,
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
        // Determine if vUv is within the desired range
        float inRangeX = step(0.4, vUv.x) * step(vUv.x, 0.6);
        float inRangeY = step(0.4, vUv.y) * step(vUv.y, 0.6);
        float inRange = inRangeX * inRangeY; // 1.0 if both conditions are met, 0.0 otherwise

        // Calculate the color based on inRange
        vec3 color = mix(vec3(vUv.y, 0.0, 1.0 - vUv.x), vec3(0.0, 0.0, 0.0), inRange);

        gl_FragColor = vec4(color, 1.0);
      }
    `
    })
}