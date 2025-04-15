export default {
    name: 'Cosmic Plasma',
    description: 'Dynamic cosmic plasma with flowing tendrils and orbital motion',
    author: 'Claude',
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2() }
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
      uniform vec2 resolution;
      varying vec2 vUv;
      
      #define PI 3.14159265359
      
      // Complex number operations
      vec2 cMul(vec2 a, vec2 b) {
        return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
      }
      
      vec2 cPow(vec2 z, float n) {
        float r = length(z);
        float theta = atan(z.y, z.x);
        return pow(r, n) * vec2(cos(n * theta), sin(n * theta));
      }
      
      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      
      // Fractal Brownian Motion
      float fbm(vec2 p) {
        float f = 0.0;
        float w = 0.5;
        for (int i = 0; i < 5; i++) {
          f += w * sin(p.x + time * 0.1) * cos(p.y + sin(time * 0.05) * 0.2);
          p = cMul(p, vec2(1.2, 1.3)) + 0.126;
          p *= 1.3;
          w *= 0.7;
        }
        return f;
      }
      
      // Voronoi noise
      float voronoi(vec2 x) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        float md = 8.0;
        vec2 m = vec2(0.0);
        
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash21(n + g) * vec2(sin(time * 0.3), cos(time * 0.2));
            o = 0.5 + 0.5 * sin(time * 0.5 + 6.28 * o);
            
            vec2 r = g + o - f;
            float d = dot(r, r);
            
            if (d < md) {
              md = d;
              m = n + g + o;
            }
          }
        }
        return md;
      }
      
      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.3, 0.2, 0.2);
        
        return a + b * cos(6.28318 * (c * t + d));
      }
      
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;
        
        // Transforming coordinates
        float angle = time * 0.1;
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 rotatedUV = rot * uv;
        
        // Create orbital motion
        float dist = length(uv);
        float angle2 = atan(uv.y, uv.x);
        float orbitFactor = sin(dist * 5.0 - time * 0.5) * 0.1;
        vec2 orbitUV = vec2(
          uv.x + cos(angle2 + time * 0.2 + dist * 2.0) * orbitFactor,
          uv.y + sin(angle2 + time * 0.3 + dist * 2.0) * orbitFactor
        );
        
        // Fractal plasma base
        float plasma = fbm(orbitUV * 3.0) * 0.5 + 0.5;
        
        // Voronoi cells add structure
        float cells = voronoi(orbitUV * 4.0 + time * 0.2);
        cells = 1.0 - smoothstep(0.0, 0.2, cells);
        
        // Combining effects with dynamic blend
        float blend = sin(time * 0.2) * 0.5 + 0.5;
        float pattern = mix(plasma, cells, blend * 0.5);
        
        // Dynamic vortex effect
        vec2 vortexUV = orbitUV;
        float vortexStrength = sin(time * 0.2) * 0.5 + 0.5;
        float vortex = 0.0;
        
        for (int i = 0; i < 5; i++) {
          float fi = float(i) / 5.0;
          float timeOffset = time * (0.1 + fi * 0.2);
          vec2 offset = vec2(
            cos(timeOffset + fi * PI * 2.0),
            sin(timeOffset * 1.5 + fi * PI * 2.0)
          ) * vortexStrength;
          
          vortexUV = cMul(vortexUV, vec2(cos(timeOffset * 0.2), sin(timeOffset * 0.2)));
          vortex += smoothstep(0.4, 0.0, length(vortexUV - offset * 0.3));
        }
        
        // Final pattern with layering
        pattern = pattern * 0.7 + vortex * 0.3;
        
        // Color mapping
        vec3 baseColor = palette(pattern + time * 0.05);
        
        // Add dynamic glow
        float glow = max(0.0, 1.0 - length(uv) * 0.8);
        glow = pow(glow, 3.0) * 2.0;
        
        // Edge highlighting
        float edge = abs(pattern - 0.5) * 2.0;
        edge = pow(edge, 8.0) * 2.0;
        
        // Final color composition
        vec3 color = baseColor;
        color += glow * palette(time * 0.1) * 0.5;
        color += edge * palette(pattern + 0.3) * 0.5;
        
        // Gamma correction
        color = pow(color, vec3(0.8));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
        onBeforeRender: function(renderer, scene, camera, geometry, material) {
            this.uniforms.time.value += 0.01;
            this.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
        }
    })
}