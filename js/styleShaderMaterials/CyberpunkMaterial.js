export const CyberpunkMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
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
      uniform float time;
      uniform vec2 resolution;
  
      // Noise function for glitch effects
      float noise(vec2 p) {
        return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
      }
  
      // Function to create the grid pattern
      float gridPattern(vec2 uv, float scale) {
        uv *= scale;
        vec2 grid = fract(uv) - 0.5;
        return smoothstep(0.45, 0.5, length(grid));
      }
  
      void main() {
        vec2 uv = vUv * 2.0 - vec2(1.0);
        uv.x *= resolution.x / resolution.y;
  
        // Pulsing neon background
        float neonPulse = 0.5 + 0.5 * sin(time * 1.0);
        vec3 baseColor = vec3(0.8, 0.8, 0.2) * neonPulse;
  
        // Grid overlay with a moving glitch effect
        float grid = gridPattern(uv + vec2(0.0, time * -0.05), 12.0);
        vec3 gridColor = mix(vec3(0.5, 0.2, 0.3), vec3(1.0, 0.1, 0.2), grid);
  
        // Glitchy interference lines
        float glitch = step(0.65, sin(uv.y * 20.0 + time * 2.0) + noise(uv * 10.0 + time * 0.02));
        vec3 glitchColor = vec3(0.9, 0.9, 0.9) * glitch;
  
        // Combine base color, grid, and glitch effects
        vec3 color = baseColor + gridColor * grid + glitchColor;
  
        // Subtle RGB shift for a holographic feel
        color.r = color.r + 0.1 * sin(time * 2.0 + uv.y * 12.0);
        color.g = color.g + 0.1 * sin(time * 2.5 + uv.x * 12.0);
        color.b = color.b + 0.1 * sin(time * 3.0 + uv.y * 12.0);
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  