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
    uniform sampler2D uTexture_3;
    uniform float time;
    varying vec2 vUv;
    
    float getLength(vec4 color) {
        return color.r + color.g + color.b ;
    }

    void main() {
        vec4 color_main = texture2D(uTexture_1, vUv); 
        vec4 color_central = texture2D(uTexture_2, vUv); 
        vec4 color_around = texture2D(uTexture_3, vUv); 

        vec4 color_final = vec4(0.0) ; 

        if(length(color_around) < 1.9) {
            float decal = 0.0 ; 
            
            color_around = texture2D(uTexture_3, mod(vec2(vUv.x + time + decal, vUv.y), 1.0)); 
           
            // Search one texel at a time (the images/bebe/ pictures are 682 wide): a step of
            // 1e-7 meant up to 10 million texture reads per pixel and froze the page (7ad4f7b).
            for (int i = 0; i < 682; i++) {
                if (getLength(color_around) <= 2.9) break;
                decal += 1.0 / 682.0;
                color_around = texture2D(uTexture_3, mod(vec2(vUv.x + time + decal, vUv.y), 1.0));
            }
            color_final = color_around ; 
        } else {
            color_final = color_main ; 
        }
        

        gl_FragColor = color_final;
    }
    `
});