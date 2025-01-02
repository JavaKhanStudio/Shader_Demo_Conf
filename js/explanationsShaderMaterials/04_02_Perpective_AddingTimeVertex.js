export default {
    name: 'Perspective',
    explanationFR: '',
    explanationENG: '',
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 0.0}
        },
        vertexShader: `
          varying vec2 vUv;
          uniform float time;
          
          void main() {
            vUv = uv;
            float animatedW = 1.0 - (0.33 * sin(time * 0.5));
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, animatedW);
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