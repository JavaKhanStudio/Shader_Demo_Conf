export const ScreamerMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTexture: { value: null },
        time: { value: 0.0 },
        intensity: { value: 1. }
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
        uniform sampler2D uTexture;
        uniform float intensity;
        varying vec2 vUv;

        // A noise function to create distortion
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        // Smooth noise for fluid motion
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
            // Distortion based on time and intensity
            vec2 distortedUv = vUv + vec2(
                sin(vUv.y * 10.0 + time * 1.5) * 0.01 * intensity,
                cos(vUv.x * 10.0 + time * 1.5) * 0.01 * intensity
            );

            // Adding wavy effect similar to the sky's strokes in "The Scream"
            distortedUv += vec2(
                sin(distortedUv.y * 15.0 + time * 2.0) * 0.02 * intensity,
                cos(distortedUv.x * 15.0 + time * 2.0) * 0.02 * intensity
            );

            // Get the texture color with distortion
            vec4 color = texture2D(uTexture, distortedUv);

            // Emphasize yellows above a threshold
            if(color.r > 0.4 && color.g > 0.4 && color.b < .4)
            {
                color.r = color.r + ((color.r * intensity) / 6.0) * abs(sin(time)) ; 
                color.g = color.g + ((color.g * intensity) / 6.0) * abs(sin(time)); 
                color.b = color.b - ((color.b * intensity) / 4.0) * abs(sin(time * 2.0)); 
            }

            gl_FragColor = vec4(color.rgb, color.a);
        }
    `
});
