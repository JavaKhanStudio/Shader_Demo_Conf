// Made by Chat GPT

export default new THREE.ShaderMaterial({
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
        vec3 color = vec3(vUv.x, vUv.y, 1.0 - vUv.x);
        gl_FragColor = vec4(color, 1.0);
      }
    `
});
