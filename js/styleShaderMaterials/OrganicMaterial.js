export default new THREE.ShaderMaterial({
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
  
      // Smooth noise function for natural forms
      float noise(vec2 p) {
        return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
      }
  
      // Smooth organic noise
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
  
      // Function to create organic animation
      float organicPattern(vec2 uv) {
        float n = smoothNoise(uv * 5.0 + vec2(time * 0.3, time * 0.3));
        n += 0.5 * smoothNoise(uv * 10.0 + vec2(time * 0.6, -time * 0.6));
        n += 0.25 * smoothNoise(uv * 20.0 + vec2(-time * 0.4, time * 0.8));
        return n;
      }
  
      void main() {
        // Adjust coordinates for organic flow
        vec2 uv = vUv * 3.0 - vec2(1.5);
        
        // Generate flowing organic pattern
        float pattern = organicPattern(uv);
        
        // Color modulation for organic effect
        vec3 color = vec3(
          0.3 + 0.5 * sin(3.0 * pattern + time * 0.6),
          0.2 + 0.6 * sin(2.0 * pattern + time * 0.8),
          0.4 + 0.3 * sin(4.0 * pattern + time * 1.2)
        );
  
 
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  