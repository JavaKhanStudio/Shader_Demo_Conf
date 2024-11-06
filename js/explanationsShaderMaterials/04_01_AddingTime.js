export const AddingTimeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    speed: { value: 0.2 }
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
      
      float sinTimeMovement = abs(cos(time * speed)) ;

      // Calculate the color based on inRange
      vec3 color = vec3(vUv.y - sinTimeMovement, 0.0, 1.0 - vUv.x) ; 

      gl_FragColor = vec4(color, 1.0);
    }
  `
  });