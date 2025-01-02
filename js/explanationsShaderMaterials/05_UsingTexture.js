export default {
    name: 'Using Texture',
    explanationFR: '',
    explanationENG: '',
    baseImage: './images/syn/youngSitting.jpg',
    codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/05_texture.js",
    material: new THREE.ShaderMaterial({
        uniforms: {
            uTexture: {value: null},
            time: {value: 0.0}
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
        uniform sampler2D uTexture;
        void main() {
          vec4 color = texture2D(uTexture, vUv);
          gl_FragColor = color;
        }
      `
    })
}
