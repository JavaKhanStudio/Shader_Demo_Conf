export const BasicMaterial = new THREE.ShaderMaterial({
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
  });