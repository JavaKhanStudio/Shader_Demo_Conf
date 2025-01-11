export default {
  name: 'Wave Pattern',
  description: '',
  author: 'Claude',
  material: new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0.0},
      amplitude: {value: 0.2},
      frequency: {value: 5.0},
      colorSpeed: {value: 1.0}
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform float time;
      uniform float amplitude;
      uniform float frequency;
  
      void main() {
        vUv = uv;
        
        // Create wave effect
        float elevation = sin(position.x * frequency + time) * amplitude;
        elevation += sin(position.y * frequency * 0.8 + time) * amplitude;
        
        vec3 newPosition = position;
        newPosition.z += elevation;
        vElevation = elevation;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float colorSpeed;
      varying vec2 vUv;
      varying float vElevation;
  
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
  
      void main() {
        // Create dynamic color based on elevation and time
        float hue = vElevation * 2.0 + time * colorSpeed;
        vec3 hsvColor = vec3(hue, 0.8, 0.9);
        vec3 rgbColor = hsv2rgb(hsvColor);
        
        // Add subtle gradient based on UV coordinates
        float gradient = sin(vUv.y * 3.14159);
        rgbColor *= 0.8 + 0.2 * gradient;
        
        // Add shimmer effect
        float shimmer = sin(vUv.x * 50.0 + time * 5.0) * sin(vUv.y * 50.0 + time * 5.0) * 0.1;
        rgbColor += shimmer;
        
        gl_FragColor = vec4(rgbColor, 1.0);
      }
    `
  })
}