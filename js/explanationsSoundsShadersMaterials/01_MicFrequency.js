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

            float phase = (vUv.x * 10.0 - time * 2.0) * 10.0;
            float lineY = 0.5 + amplitude * sin(phase);

            // Distance to the curve, not just the vertical gap: dividing by the slope
            // keeps the steep parts as thick as the flat ones, so a loud sound
            // does not break the line into dashes
            float slope = amplitude * 100.0 * cos(phase);
            float dist = abs(vUv.y - lineY) / sqrt(1.0 + slope * slope);

            // Plot the line with some thickness
            float lineWidth = 0.02;
            float line = smoothstep(0.0, lineWidth, lineWidth - dist);

            // Set the color of the line (white) against the background
            color = mix(color, vec3(0.0), line);

            gl_FragColor = vec4(color, 1.0);
        }
    `
});
