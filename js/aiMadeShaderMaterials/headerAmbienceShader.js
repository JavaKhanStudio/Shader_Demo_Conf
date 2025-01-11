// Made by Claude

export default
{
  name: 'Header Ambience',
  description: "",
  author: 'Claude',
  material : new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2() },
      mousePosition: { value: new THREE.Vector2(0.5, 0.5) }
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
        uniform vec2 mousePosition;
        varying vec2 vUv;
    
        float noise(vec2 p) {
          return sin(p.x * 10.0) * sin(p.y * 10.0) * 0.5 + 0.5;
        }
    
        void main() {
          // Create responsive grid
          vec2 pos = vUv;
          pos *= 1.5; // Scale for better visual rhythm
          
          // Smooth flowing background waves
          float flowSpeed = 0.15;
          float wave1 = sin(pos.x * 3.0 + time * flowSpeed) * cos(pos.y * 3.0 + time * flowSpeed) * 0.5;
          float wave2 = sin(pos.x * 2.0 - time * flowSpeed) * cos(pos.y * 2.0 - time * flowSpeed) * 0.5;
          
          // Interactive highlight based on mouse position
          float mouseDist = length(pos - mousePosition);
          float mouseGlow = smoothstep(0.5, 0.0, mouseDist) * 0.5;
          
          // Gradient base
          vec3 color1 = vec3(0.1, 0.15, 0.3); // Deep blue
          vec3 color2 = vec3(0.3, 0.4, 0.5);  // Light blue-gray
          
          // Combine effects
          float pattern = wave1 + wave2;
          vec3 finalColor = mix(color1, color2, pattern + mouseGlow);
          
          // Add subtle sparkle effect
          float sparkle = noise(pos * 20.0 + time) * smoothstep(0.4, 0.5, sin(time * 2.0));
          finalColor += sparkle * 0.1;
          
          // Vignette effect
          float vignette = smoothstep(1.0, 0.3, length(vUv - 0.5));
          finalColor *= vignette * 1.2;
          
          // Enhance contrast slightly
          finalColor = pow(finalColor, vec3(1.1));
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    })
}