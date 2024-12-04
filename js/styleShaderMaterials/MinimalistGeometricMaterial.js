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
  
      // Function to draw a circle
      float drawCircle(vec2 uv, vec2 center, float radius) {
        return 1.0 - smoothstep(radius - 0.01, radius + 0.01, length(uv - center));
      }
  
      // Function to draw a rotating square
      float drawSquare(vec2 uv, vec2 center, float size, float angle) {
        vec2 p = uv - center;
        float s = sin(angle);
        float c = cos(angle);
        p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
        vec2 d = abs(p) - vec2(size * 0.5);
        return 1.0 - smoothstep(0.0, 0.01, max(d.x, d.y));
      }
  
      // Function to draw a triangle
      float drawTriangle(vec2 uv, vec2 p0, vec2 p1, vec2 p2) {
        vec2 e0 = p1 - p0;
        vec2 e1 = p2 - p1;
        vec2 e2 = p0 - p2;
        vec2 v0 = uv - p0;
        vec2 v1 = uv - p1;
        vec2 v2 = uv - p2;
        float area = abs(e0.x * e2.y - e0.y * e2.x);
        float w0 = (v0.x * e0.y - v0.y * e0.x) / area;
        float w1 = (v1.x * e1.y - v1.y * e1.x) / area;
        float w2 = (v2.x * e2.y - v2.y * e2.x) / area;
        return step(0.0, min(min(w0, w1), w2));
      }
  
      void main() {
        vec2 uv = vUv * 2.0 - vec2(1.0);
        uv.x *= resolution.x / resolution.y;
  
        // Background color
        vec3 color = vec3(0.95);
  
        // Moving circle (subtle vertical movement)
        vec2 circleCenter = vec2(0.3, sin(time * 0.5) * 0.3);
        float circle = drawCircle(uv, circleCenter, 0.15);
        color = mix(color, vec3(0.2, 0.6, 0.8), circle);
  
        // Rotating square in the center
        vec2 squareCenter = vec2(-0.3, 0.0);
        float square = drawSquare(uv, squareCenter, 0.2, time);
        color = mix(color, vec3(0.8, 0.3, 0.3), square);
  
        // Static triangle in the bottom left
        vec2 p0 = vec2(-0.5, -0.5);
        vec2 p1 = vec2(-0.3, -0.2);
        vec2 p2 = vec2(-0.1, -0.5);
        float triangle = drawTriangle(uv, p0, p1, p2);
        color = mix(color, vec3(0.3, 0.8, 0.5), triangle);
  
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  