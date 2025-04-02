export default {
    name: 'Some Color',
    explanationFR: '',
    explanationENG: '',
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