export default {
    name: 'SwirlingGradient',
    description: 'A dynamic, swirling gradient shader with vibrant colors and subtle animation.',
    author: 'Gemini + Reparation par Claude',
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(1.0, 1.0) },
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
    uniform vec2 resolution;

    #define PI 3.1415926535897932384626433832795

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0; // Center the UV coordinates
      float aspect = resolution.x / resolution.y;
      uv.x *= aspect;

      float angle = atan(uv.y, uv.x) + length(uv) * 5.0 + time * 0.5;
      float radius = length(uv) * 0.7;

      vec2 distortedUV = vec2(radius * cos(angle), radius * sin(angle));

      float hue = fract(distortedUV.x * 0.5 + distortedUV.y * 0.5 + time * 0.1);
      float saturation = smoothstep(0.0, 1.0, length(uv) * 1.2);
      float value = 1.0;

      vec3 color = hsv2rgb(vec3(hue, saturation, value));

      gl_FragColor = vec4(color, 1.0);
    }
  `
    })
};