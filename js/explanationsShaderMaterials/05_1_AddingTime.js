export const BasicMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        uniform float time;
        
        void main() {
          vUv = uv;
          // Animate w based on a sine wave to smoothly transition between values
          float animatedW = 0.5 + 0.5 * sin(time); // oscillates between 0 and 1
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, animatedW);
        }
      `,
    fragmentShader: `
        varying vec2 vUv;
        void main() {
          vec3 color = vec3(0, 0, 1.0 - vUv.x);
          gl_FragColor = vec4(color, 1.0);
        }
      `
  });
