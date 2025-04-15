export default {
    name: 'Cosmic Nebula',
    description: 'An animated cosmic nebula with swirling colors and sparkling stars',
    author: 'DeepSeek',
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2() }
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
      uniform vec2 resolution;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      // Noise functions by Inigo Quilez
      float hash(float n) { return fract(sin(n) * 1e4); }
      float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
      
      float noise(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        
        float n = p.x + p.y * 157.0 + 113.0 * p.z;
        return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                     mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
                 mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                     mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
      }
      
      // Star field
      float stars(vec2 uv, float density) {
        uv *= 50.0;
        vec2 p = floor(uv);
        float r = hash(p);
        float star = smoothstep(density, 0.0, r) * smoothstep(0.3, 0.32, r);
        return star * pow(sin(time + r * 10.0) * 0.5 + 0.5, 5.0);
      }
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;
        
        // Animate coordinates
        vec3 p = vec3(uv, time * 0.1);
        
        // Layered noise for nebula effect
        float f = 0.0;
        f += 0.5000 * noise(p * 1.0); p *= 2.02;
        f += 0.2500 * noise(p * 1.5); p *= 2.03;
        f += 0.1250 * noise(p * 2.0); p *= 2.01;
        f += 0.0625 * noise(p * 3.0);
        
        // Color mapping
        vec3 color = vec3(0.0);
        color = mix(vec3(0.1, 0.2, 0.8), vec3(0.8, 0.2, 0.4), smoothstep(0.3, 0.7, f));
        color = mix(color, vec3(0.9, 0.6, 0.2), smoothstep(0.5, 0.8, f));
        color = mix(color, vec3(1.0), smoothstep(0.8, 0.9, f));
        
        // Add stars
        float starField = stars(vUv, 0.97);
        color += starField * vec3(1.0, 0.9, 0.8);
        
        // Add pulsing core
        float dist = length(uv);
        float pulse = 0.5 + 0.5 * sin(time * 0.5);
        color += vec3(1.0, 0.7, 0.3) * smoothstep(0.5, 0.0, dist) * pulse * 0.5;
        
        // Vignette effect
        float vignette = 1.0 - smoothstep(0.7, 1.4, length(uv));
        color *= vignette;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
    })
}