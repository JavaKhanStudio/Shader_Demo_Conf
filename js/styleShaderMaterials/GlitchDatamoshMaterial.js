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
  
      // Random noise function for glitch effect
      float random(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
  
      // Glitch offset function to create pixel shifting
      vec2 glitchOffset(vec2 uv, float intensity) {
        uv.y += random(vec2(uv.y, time)) * intensity * 0.1;
        uv.x += random(vec2(uv.x, uv.y + time)) * intensity * 0.05;
        return uv;
      }
  
      void main() {
        vec2 uv = vUv;
        float intensity = 0.5 + 0.5 * sin(time * 2.0);
  
        // Apply glitch offset to create displacement in color channels
        vec2 uvR = glitchOffset(uv, intensity);
        vec2 uvG = glitchOffset(uv, intensity * 0.8);
        vec2 uvB = glitchOffset(uv, intensity * 1.2);
  
        // Procedural color generation based on UV and time
        float r = 0.5 + 0.5 * sin(uvR.x * 10.0 + uvR.y * 10.0 + time);
        float g = 0.5 + 0.5 * sin(uvG.x * 12.0 + uvG.y * 12.0 + time * 1.1);
        float b = 0.5 + 0.5 * sin(uvB.x * 14.0 + uvB.y * 14.0 + time * 1.3);
  
        // Combine glitchy colors
        vec3 color = vec3(r, g, b);
  
        // Add interference pattern with horizontal and vertical bars
        float interference = sin(uv.y * 50.0 + time * 10.0) * 0.1;
        interference += sin(uv.x * 30.0 - time * 15.0) * 0.05;
        color += vec3(interference);
  
        // Random noise flashes to enhance datamosh effect
        float flash = step(0.95, random(vec2(time, uv.y))) * 0.3;
        color += flash;
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  