export const ImageWorkInvertedMaterial = new THREE.ShaderMaterial({
  uniforms: {
      uTexture: { value: null },
      time: { value: 0.0 }
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
      
        vec4 color = texture2D(uTexture, vUv);

        float blueIntensity = color.b - color.r;
        if (blueIntensity > 0.3) { 
          float grayscale = (color.r + color.g + color.b) / 3.0;
          color = vec4(vec3(grayscale), color.a);
        } else if ((color.r + color.g + color.b) < 1.5) { 
          float shift = sin(time + color.r * 10.0 + vUv.x * 2.0) * 0.2; 
          color.r += shift;
          color.g -= shift;
          color.b += shift;
        }

        gl_FragColor = color;
      }
    `
});
