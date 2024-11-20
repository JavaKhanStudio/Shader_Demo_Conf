export const MicFrequency = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        amplitude: { value: 0 } // Neutral point
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
        uniform float amplitude;
        varying vec2 vUv;

        void main() {
            vec3 color = vec3(1.0); // Background color

            float lineY = 0.5 + (amplitude * sin((vUv.x * 10.0 - time * 2.0) * 10.0));

            // Plot the line with some thickness
            float lineWidth = 0.02;
            float line = smoothstep(0.0, lineWidth, lineWidth - abs(vUv.y - lineY));

            // Set the color of the line (white) against the background
            color = mix(color, vec3(0.0), line);

            gl_FragColor = vec4(color, 1.0);
        }
    `
});
