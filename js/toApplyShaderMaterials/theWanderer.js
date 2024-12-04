export default new THREE.ShaderMaterial({
    uniforms: {
        uTexture_1: { value: null }, // First texture
        uTexture_2: { value: null }, // Second texture
        time: { value: 0.0 } // Optional time uniform if needed for animations
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
    precision highp float;

    uniform sampler2D uTexture_1;
    uniform sampler2D uTexture_2;
    varying vec2 vUv;

    void main() {
        vec4 color1 = texture2D(uTexture_1, vUv + vec2(0.0005, 0.0005)); // Adjust UV slightly for alignment
        vec4 color2 = texture2D(uTexture_2, vUv + vec2(0.0005, 0.0005)); // Adjust UV slightly for alignment

        vec4 finalColor = vec4 (0.0);

        if (color1.a > 0.0) {
            finalColor += color1;
        } 

        if (color2.a > 0.0) {
            finalColor += color2;
        }

        gl_FragColor = finalColor;
    }
    `
});
