export const AddingTimeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    speed: { value: 0.8 }
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
    uniform float speed;
    
    void main() {
      // Create a color that changes over time
      float animatedValue = sin(time * speed);  // Oscillates between -1 and 1
      vec3 color = vec3(vUv.x, animatedValue, 0.0); 

      // Display the color
      gl_FragColor = vec4(color, 1.0);
    }
  `
});
