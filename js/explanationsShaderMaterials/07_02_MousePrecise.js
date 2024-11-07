export const MousePreciseMaterial = new THREE.ShaderMaterial({
  uniforms: {
      uTexture: { value: null },
      time: { value: 0.0 },
      mousePosition: { value: new THREE.Vector2(0.5, 0.5) } // Initialize at center
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
      uniform vec2 mousePosition;

      void main() {
        vec4 color = texture2D(uTexture, vUv);

        // Calculate distance from mouse position to current fragment
        float dist = distance(vUv, mousePosition);

        // Dimming effect based on distance (adjust strength as needed)
        float dimFactor = smoothstep(0.2, 0.3, dist); // Adjust the radius here
        color.rgb *= dimFactor; // Apply dimming

        gl_FragColor = color;
      }
    `
});
