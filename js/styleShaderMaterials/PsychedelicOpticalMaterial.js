export const PsychedelicOpticalMaterial = new THREE.ShaderMaterial({
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
  
      // Radial symmetry function for kaleidoscopic effect
      vec2 kaleidoscope(vec2 uv, float segments) {
        float angle = atan(uv.y, uv.x);
        float radius = length(uv);
        angle = mod(angle, 3.1415926 / segments);
        return vec2(cos(angle), sin(angle)) * radius;
      }
  
      void main() {
        vec2 uv = vUv * 2.0 - vec2(1.0);
        uv.x *= resolution.x / resolution.y;
  
        // Apply kaleidoscopic transformation for radial symmetry
        uv = kaleidoscope(uv, 6.0);
  
        // Generate a dynamic, pulsating pattern
        float pattern = sin(10.0 * uv.x + time * 3.0) * cos(10.0 * uv.y - time * 3.0);
        pattern += sin(uv.x * uv.y * 20.0 + time * 5.0);
  
        // Intense color cycling for a psychedelic feel
        vec3 color = vec3(
          0.5 + 0.5 * sin(pattern + time * 1.5),
          0.5 + 0.5 * sin(pattern + time * 2.0),
          0.5 + 0.5 * sin(pattern + time * 2.5)
        );
  
        // Add a pulsing intensity effect
        float pulse = 0.5 + 0.5 * sin(time * 5.0);
        color *= pulse;
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  