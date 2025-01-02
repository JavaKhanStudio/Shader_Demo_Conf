export default {
    name: 'Too Much',
    explanationFR: '',
    explanationENG: '',
    baseImage: './images/syn/youngSitting.jpg',
    material: new THREE.ShaderMaterial({
        uniforms: {
            uTexture: {value: null},
            time: {value: 0.0}
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
        uniform sampler2D uTexture;
        uniform float time;
  
        void main() {
          vec2 uvOffset = vUv;
        
          vec4 color = texture2D(uTexture, uvOffset);
  
          float blueIntensity = color.b - color.r;
          if (blueIntensity > 0.3) { 
            float grayscale = (color.r + color.g + color.b) / 3.0;
            color = vec4(vec3(grayscale), color.a);
          } else if ((color.r + color.g + color.b) > 1.4) { 
            uvOffset += vec2(sin(time * 10.0) * 0.005, cos(time * 10.0) * 0.005);
            color = texture2D(uTexture, uvOffset);

            float shift = sin(time + color.r * 10.0 + vUv.x) * 0.2; 
            color.r += shift;
            color.g -= shift;
            color.b += shift;
          } else {
            uvOffset -= vec2(cos(time * 10.0) * 0.005, sin(time * 10.0) * 0.005);
            color = texture2D(uTexture, uvOffset);

            float shift = sin(time + color.r * 10.0 + vUv.x) * 0.2; 
            color.r -= shift;
            color.g += shift;
            color.b += shift;
          }
  
          gl_FragColor = color;
        }
      `
    })
}