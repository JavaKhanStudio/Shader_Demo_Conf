export const SurrealDreamlikeMaterial = new THREE.ShaderMaterial({
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
  
      // Smooth noise function
      float noise(vec2 p) {
        return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
      }
  
      // Smooth, flowing noise pattern
      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f*f*(3.0-2.0*f);
        
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
  
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
  
      // Create a layered noise pattern for surreal textures
      float surrealPattern(vec2 uv) {
        float n = smoothNoise(uv * 1.0 + vec2(time * 0.2, time * 0.3));
        n += 0.5 * smoothNoise(uv * 2.0 + vec2(time * 0.6, -time * 0.4));
        n += 0.25 * smoothNoise(uv * 4.0 + vec2(-time * 0.8, time * 0.5));
        return n;
      }
  
      void main() {
        vec2 uv = vUv * 2.0 - vec2(1.0);
        uv.x *= resolution.x / resolution.y;
  
        // Generate flowing, dreamlike patterns
        float pattern = surrealPattern(uv);
  
        // Color gradient based on the pattern, with a dreamlike blend
        vec3 color = vec3(
          0.5 + 0.5 * sin(3.0 * pattern + time * 0.6),
          0.5 + 0.5 * sin(2.0 * pattern + time * 0.8),
          0.6 + 0.4 * cos(3.0 * pattern + time * 1.2)
        );
  
        // Subtle color shifting to give a surreal and dreamlike effect
        color.r += 0.1 * sin(time * 0.7 + uv.y * 6.0);
        color.g += 0.1 * cos(time * 0.9 + uv.x * 6.0);
        color.b += 0.1 * sin(time * 0.8 + uv.y * 6.0);
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  