export const TunnelMaterialV2 = new THREE.ShaderMaterial({
  uniforms: {
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, // Screen resolution
    iTime: { value: 0.0 } // Time in seconds
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv; // Pass UV coordinates to the fragment shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define ROTATE(a) mat2(cos(a), sin(a), -sin(a), cos(a))
    #define NOISE(p) fract(29.0 * sin(p.xyzx) * sin(p.yzxx))

    uniform vec2 iResolution; // Viewport resolution (width, height)
    uniform float iTime;      // Shader playback time (in seconds)

    varying vec2 vUv;

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec3 position, color;
      float iteration = 0.0;
      float accumulator = 1.0;
      float time = iTime * -0.62; // Adjusted time
      float stepValue;

      vec4 fragColor = vec4(0.0);
      vec2 resolution = vec2(800.0, 450.0);

      // Precompute constants outside the loop
      float rotationAngle = time / 18.0;
      mat2 rotationMatrix = ROTATE(rotationAngle);
      float cosTime001 = cos(time * 0.001);
      float sinTime001 = sin(time * 0.001);
      float cosTime02 = cos(time * 0.2);
      float offsetScale = -cosTime02 * 0.5;
      vec2 centeredCoord = (fragCoord * 2.0 - resolution.xy) / resolution.y;
      vec2 scaledCoord = centeredCoord / 10.0;

      // Reduce loop iterations for performance
      const float MAX_ITERATIONS = 50.0;

      for (float i = 1.0; i <= MAX_ITERATIONS; i++) {
        stepValue = accumulator + time;

        // Compute offset
        float cosStep001 = cos(stepValue * 0.001);
        float sinStep001 = sin(stepValue * 0.001);
        vec2 offset = vec2(cosTime001 - cosStep001, sinTime001 - sinStep001) * offsetScale;

        // Compute rotated coordinate
        vec2 rotatedCoord = scaledCoord * accumulator * rotationMatrix;

        // Compute position vector
        position = acos(cos(vec3(rotatedCoord + offset, stepValue)));

        // Noise transformation (optimized to a single iteration)
        position = NOISE(position).xyz;

        // Manipulate coordinates
        position = abs(3.0 * position);
        position = position.x < position.y ? position.zxy : position.zyx;
        position -= vec3(3.0, 1.0, 2.0);

        // Color computation
        color = 0.1 * cos(stepValue * 1.57 + vec3(4.0, 8.0, 16.0)); // 1.57 approximates π/2

        // Accumulate brightness
        float lenPXZ = length(position.xz);
        float s = abs(lenPXZ / 38.0 - 0.054) + 0.00002;
        accumulator += s;
        float attenuation = exp(i * i * s / 28.0);

        fragColor.rgb += (color * color) / attenuation;
      }

      // Final output
      fragColor.a = 1.0; // Set alpha to fully opaque
      gl_FragColor = fragColor;
    }
  `
});
