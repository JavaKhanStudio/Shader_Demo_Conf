export const ShaderArtMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        iResolution: { value: new THREE.Vector3() }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 iResolution;
        varying vec2 vUv;

        vec3 palette(float t) {
            vec3 a = vec3(0.5, 0.5, 0.5);
            vec3 b = vec3(0.5, 0.5, 0.5);
            vec3 c = vec3(1.0, 1.0, 1.0);
            vec3 d = vec3(0.263, 0.416, 0.557);

            return a + b * cos(6.28318 * (c * t + d));
        }

        void main() {
            vec2 uv = (vUv * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);
            vec2 uv0 = uv;
            vec3 finalColor = vec3(0.0);

            for (float i = 0.0; i < 4.0; i++) {
                uv = fract(uv * 1.5) - 0.5;
                float d = length(uv) * exp(-length(uv0));
                vec3 col = palette(length(uv0) + i * 0.4 + time * 0.4);
                d = sin(d * 8.0 + time) / 8.0;
                d = abs(d);
                d = pow(0.01 / d, 1.2);
                finalColor += col * d;
            }

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
});