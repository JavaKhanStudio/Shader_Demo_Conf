export default {
    name: 'Mouse Show Precise',
    explanationFR: '',
    explanationENG: '',
    baseImage: './images/syn/youngSitting.jpg',
    preciseMouse: true,
    codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/07_02_MouseComplex.js",
    material: new THREE.ShaderMaterial({
        uniforms: {
            uTexture: {value: null},
            time: {value: 0.0},
            mousePosition: {value: new THREE.Vector2(0.5, 0.5)} // Initialize at center
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
      uniform vec2 mousePosition;

      void main() {
        vec4 textureColor = texture2D(uTexture, vUv);
        float dist = distance(vUv, mousePosition);    
        gl_FragColor = textureColor - vec4(vec3(dist * 2.2), 0.0);
      }
    `
    })
}
