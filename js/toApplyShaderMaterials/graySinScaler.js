export const GraySinScalerMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTexture_1: { value: null },
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
      uniform float time;
      uniform sampler2D uTexture_1;
      varying vec2 vUv;

      void main() {
          vec4 color = texture2D(uTexture_1, vUv);

          // Calculate grayscale value
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

          // Use a sine function based on time to blend grayscale effect
          float blendFactor = abs((sin(time * 1.0) + 1.0) / 2.0);
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);

          // Apply grayscale to areas closer to the center and controlled by sine wave
          vec3 finalColor = mix(color.rgb, vec3(gray), smoothstep(0.2, 0.5, blendFactor * dist));

          gl_FragColor = vec4(finalColor, color.a);
      }
  `
});
