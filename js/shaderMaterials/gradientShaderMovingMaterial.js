export const GradientShaderMovingMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 }, // Add a time uniform
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time; // Receive time as a uniform
    varying vec2 vUv;
    void main() {
      // Create a color that changes over time
      vec3 color = vec3(0.5 + 0.5 * cos(time + vUv.x * 10.0), vUv.y, 1.0 - vUv.x);
      gl_FragColor = vec4(color, 1.0);
    }
  `
});
