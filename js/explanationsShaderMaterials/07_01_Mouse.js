export default {
    name: 'Mouse Show',
    explanationFR: '',
    explanationENG: '',
    baseImage: './images/syn/youngSitting.jpg',
    codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/07_01_MouseSimple.js",
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
            vec4 color = texture2D(uTexture, vUv);
    
            float dist = distance(vUv, mousePosition);
    
            float dimFactor = smoothstep(0.2, 0.3, dist); 
            color.rgb *= dimFactor; 
    
            gl_FragColor = color;
          }
        `
    })
}
