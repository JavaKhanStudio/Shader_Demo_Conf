// Made by Claude

export default new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        frequency: { value: 3.0 },
        amplitude: { value: 0.2 },
        speed: { value: 0.5 },
        depth: { value: 2.0 },
        clarity: { value: 0.8 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform float frequency;
        uniform float amplitude;
        uniform float speed;
        uniform float depth;
        uniform float clarity;
        
        varying vec2 vUv;
        varying vec3 vPosition;

        // Improved noise function for more natural water movement
        vec2 hash2(vec2 p) {
            p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
            return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            
            vec2 u = f * f * (3.0 - 2.0 * f);

            float n = mix(
                mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                    dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                    dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x),
                u.y
            );
            
            return 0.5 + 0.5 * n;
        }

        float wavePattern(vec2 st) {
            // Layer multiple waves at different frequencies
            float wave1 = sin(st.x * frequency + time * speed) * amplitude;
            float wave2 = cos(st.y * frequency - time * speed * 0.8) * amplitude;
            float wave3 = sin((st.x + st.y) * frequency * 0.5 + time * speed * 1.2) * amplitude * 0.5;
            
            // Add noise-based turbulence
            float turbulence = noise(st * 3.0 + time * 0.1) * amplitude * 0.5;
            
            return wave1 + wave2 + wave3 + turbulence;
        }

        void main() {
            float wave = wavePattern(vUv);
            
            // Create depth effect
            float depthFactor = smoothstep(-0.2, 0.2, wave) * depth;
            
            // Base water color with depth variation
            vec3 shallowColor = vec3(0.4, 0.6, 0.8);
            vec3 deepWaterColor = vec3(0.1, 0.2, 0.4);
            vec3 baseColor = mix(shallowColor, deepWaterColor, depthFactor);
            
            // Add caustics effect
            float caustics = pow(noise(vUv * 8.0 + time * 0.2), 3.0) * clarity;
            baseColor += caustics * vec3(0.2, 0.3, 0.3);
            
            // Add foam effect at wave peaks
            float foam = smoothstep(0.4, 0.8, wave);
            baseColor = mix(baseColor, vec3(1.0), foam * 0.3);
            
            // Add subtle iridescence
            float iridescence = sin(wave * 8.0 + time) * 0.1;
            baseColor.rb += iridescence;
            
            // Apply clarity and atmospheric perspective
            baseColor = mix(baseColor, vec3(0.6, 0.8, 1.0), 1.0 - clarity);
            
            gl_FragColor = vec4(baseColor, 1.0);
        }
    `
});