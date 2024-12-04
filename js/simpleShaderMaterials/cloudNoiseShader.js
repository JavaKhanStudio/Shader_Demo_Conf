// Made by Claude

export default new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    density: { value: 1.5 }
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
      uniform float density;
      varying vec2 vUv;
  
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
  
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
  
      void main() {
        vec2 pos = vUv * density;
        float n = 0.0;
        
        // Layered noise for cloud-like formations
        n += noise(pos + time * 0.1) * 0.5;
        n += noise(pos * 2.0 + time * 0.15) * 0.25;
        n += noise(pos * 4.0 + time * 0.2) * 0.125;
        n += noise(pos * 8.0 + time * 0.25) * 0.0625;
        
        vec3 color = vec3(n);
        gl_FragColor = vec4(color, 1.0);
      }
    `
});