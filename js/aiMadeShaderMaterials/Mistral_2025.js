export default {
    // Made Critical Error
    name: 'Plasma Wave',
    description: 'A mesmerizing plasma wave effect',
    author: 'Mistral + Reparation',
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2() }
        },
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `, fragmentShader:
     ` 
      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;

      float rand(vec2 n) { 
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float noise(vec2 p){
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u * u * (3.0 - 2.0 * u);

        float res = mix(
          mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
          mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res;
      }

      void main() {
        vec2 uv = vUv;
        uv *= 10.0; // Scale the UVs to repeat the pattern
        float n = noise(uv + vec2(time * 0.1, 0.0)); // Animate the noise
        n += noise(uv + vec2(0.0, time * 0.2)); // Add another layer of noise with different speed
        n = n * 0.5 + 0.5; // Normalize the noise to [0, 1] range

        // Color gradient based on the noise value
        vec3 col = 0.5 + 0.5 * cos((n + time * 0.05) * 6.2831 + vec3(0.0, 0.6, 1.0));

        gl_FragColor = vec4(col, 1.0);
      }
    `
    })
}