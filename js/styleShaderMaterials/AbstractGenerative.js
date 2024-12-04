export default new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
  
      // Simple 2D noise function
      float noise(vec2 p) {
        return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
      }
  
      // Smooth noise function for more organic shapes
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
  
      void main() {
        // Scaling coordinates
        vec2 uv = vUv * 3.0 - vec2(1.5);
        
        // Time-based noise patterns
        float n = smoothNoise(uv * 1.0 + vec2(time * 0.2));
        float n2 = smoothNoise(uv * 3.0 + vec2(time * 0.5));
        float n3 = smoothNoise(uv * 5.0 + vec2(time * 0.7));
  
        // Generative abstract color patterns
        vec3 color = vec3(
          0.5 + 0.5 * cos(3.0 * n + time * 1.5),
          0.5 + 0.5 * cos(3.0 * n2 + time * 1.2),
          0.5 + 0.5 * cos(3.0 * n3 + time * 0.8)
        );
  
        // Soft circular mask to add an organic flow
        float mask = smoothstep(0.6, 0.8, length(uv));
        color *= mask;
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  