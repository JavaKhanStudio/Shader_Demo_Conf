export default {
    name: 'Galactic Vortex',
    description: 'A dynamic, mesmerizing cosmic vortex shader with stars.',
    author: 'Chat GPT',
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
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

      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
                     mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0)), u.x), u.y);
      }

      void main() {
          vec2 st = vUv * 3.0 - vec2(1.5);
          float angle = atan(st.y, st.x);
          float radius = length(st);

          float swirl = sin(radius * 10.0 - time * 2.0) * 0.3;
          float clouds = noise(vec2(angle + swirl, radius * 5.0 - time * 0.5));

          float stars = step(0.97, noise(st * 50.0 + time * 0.5));

          vec3 color = mix(vec3(0.1, 0.0, 0.2), vec3(0.5, 0.1, 0.8), clouds);
          color += stars * vec3(1.0);

          gl_FragColor = vec4(color, 1.0);
      }
    `,
    })
}
