export const RetroPixelMaterial = new THREE.ShaderMaterial({
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
  
      // Quantize color to simulate retro palette
      vec3 quantizeColor(vec3 color) {
        color = floor(color * 4.0) / 4.0;
        return color;
      }
  
      void main() {
        // Pixelate effect
        vec2 pixelSize = vec2(1.0 / resolution.x, 1.0 / resolution.y) * 8.0;
        vec2 uv = floor(vUv / pixelSize) * pixelSize;
  
        // Generate retro color patterns
        vec3 color = vec3(
          0.5 + 0.5 * sin(uv.x * 30.0 + time * 5.0),
          0.5 + 0.5 * sin(uv.y * 30.0 + time * 4.5),
          0.5 + 0.5 * sin(uv.x * 20.0 + uv.y * 20.0 + time * 6.0)
        );
  
        // Quantize colors to get a pixel art look
        color = quantizeColor(color);
  
        // Apply horizontal scanlines
        float scanline = smoothstep(0.8, 1.0, sin(uv.y * 300.0) * 0.5 + 0.5);
        color *= scanline;
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  