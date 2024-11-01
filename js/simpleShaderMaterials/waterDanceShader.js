// Made by Chat GPT

export const WaterDanceShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        frequency: { value: 1.0 },
        amplitude: { value: 0.5 },
        speed: { value: 0.5 }
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
        uniform float frequency;
        uniform float amplitude;
        uniform float speed;
        varying vec2 vUv;
  
        float wavePattern(vec2 st) {
          return sin(st.x * frequency + time * speed) * amplitude +
                 cos(st.y * frequency - time * speed) * amplitude;
        }
  
        void main() {
          float wave = wavePattern(vUv);
          
          // Color variation based on wave intensity
          vec3 color = vec3(0.2 + wave, 0.5 + wave * 0.5, 0.8 + wave * 0.3);
  
          // Add a soft glow effect
          float glow = exp(-wave * 2.0) * 0.5;
          color += glow;
  
          gl_FragColor = vec4(color, 1.0);
        }
      `
});  