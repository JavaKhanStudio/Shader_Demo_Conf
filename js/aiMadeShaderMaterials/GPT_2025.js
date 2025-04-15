export default {
  name: 'AuroraDream',
  description: 'Animated aurora-like gradient with glowing highlights',
  author: 'Chat GPT',
  material: new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(1.0, 1.0) }
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
      uniform vec2 resolution;
      varying vec2 vUv;

      float circle(vec2 uv, vec2 pos, float radius) {
        return smoothstep(radius, radius - 0.01, distance(uv, pos));
      }

      void main() {
        vec2 uv = vUv;

        // Moving waves
        float wave = sin((uv.y + time * 0.2) * 10.0) * 0.1;
        float x = uv.x + wave;

        // Color gradient with hue shift
        vec3 color = vec3(
          0.5 + 0.5 * sin(6.2831 * x + time * 0.4),
          0.5 + 0.5 * sin(6.2831 * x + time * 0.4 + 2.0),
          0.5 + 0.5 * sin(6.2831 * x + time * 0.4 + 4.0)
        );

        // Radial light burst in the center
        float glow = circle(uv, vec2(0.5), 0.3 + 0.1 * sin(time * 2.0));
        color += vec3(1.0, 0.8, 0.6) * glow * 0.8;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: false
  })
}
