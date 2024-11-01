// Made by Claude

export const GoldenSpiralShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    phi: { value: 1.618033988749895 }
  },
  vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  fragmentShader: `
      #define PI 3.14159265359
      uniform float time;
      uniform float phi;
      varying vec2 vUv;
  
      float goldenSpiral(vec2 st, float t) {
        vec2 centered = st * 2.0 - 1.0;
        float angle = atan(centered.y, centered.x);
        float radius = length(centered);
        
        // Create logarithmic spiral based on golden ratio
        float spiral = log(radius) * phi - angle;
        spiral = fract(spiral / (2.0 * PI) + t * 0.1);
        
        // Add harmonics based on golden ratio subdivisions
        float harmonic = 0.0;
        for(float i = 1.0; i < 5.0; i++) {
          float phase = pow(phi, i);
          harmonic += sin(spiral * phase * 2.0 * PI + t) / phase;
        }
        
        return smoothstep(0.1, 0.2, harmonic * 0.5 + 0.5);
      }
  
      void main() {
        float spiral = goldenSpiral(vUv, time);
        
        // Add subtle pulsing glow effect
        float glow = exp(-spiral * 3.0) * 0.5;
        float pattern = spiral + glow;
        
        // Create depth through layering
        float layer1 = goldenSpiral(vUv + vec2(0.02 * sin(time), 0.02 * cos(time)), time * 0.5);
        float layer2 = goldenSpiral(vUv - vec2(0.01 * cos(time), 0.01 * sin(time)), time * 0.3);
        
        vec3 color = vec3(pattern * 0.7 + layer1 * 0.2 + layer2 * 0.1);
        
        // Add subtle warmth
        color.r *= 1.1;
        color.g *= 0.9;
        color.b *= 0.8;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
});