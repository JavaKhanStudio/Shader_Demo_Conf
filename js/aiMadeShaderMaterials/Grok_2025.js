export default {
    name: 'AuroraGlow',
    description: 'A mesmerizing aurora-inspired shader with dynamic waves, smooth gradients, and noise-based depth.',
    author: 'Grok 3',
    material: new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) }
        },
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      varying vec2 vUv;

      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m = m * (1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h));
        vec3 g;
        g.x  = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = vUv * 2.0 - 1.0; // Center UV coordinates
        uv.x *= uResolution.x / uResolution.y; // Correct aspect ratio

        // Time-based animation
        float time = uTime * 0.2;

        // Wave patterns
        float wave1 = sin(uv.x * 3.0 + time) * cos(uv.y * 2.0 + time) * 0.5;
        float wave2 = sin(uv.x * 5.0 - time * 0.5) * cos(uv.y * 4.0 + time * 0.3) * 0.3;

        // Noise for organic variation
        float noise = snoise(uv * 2.0 + time * 0.1) * 0.2;

        // Combine patterns
        float pattern = wave1 + wave2 + noise;

        // Mouse interaction
        vec2 mouseEffect = uMouse * 2.0 - 1.0;
        float mouseDist = length(uv - mouseEffect);
        float mouseGlow = exp(-mouseDist * 5.0) * 0.3;

        // Color gradient
        vec3 color = vec3(0.0);
        color.r = sin(pattern + time) * 0.5 + 0.5;
        color.g = sin(pattern + time + 2.0) * 0.5 + 0.5;
        color.b = sin(pattern + time + 4.0) * 0.5 + 0.5;

        // Enhance colors with aurora-like hues
        color = mix(color, vec3(0.2, 0.8, 0.9), 0.4); // Cyan tint
        color = mix(color, vec3(0.9, 0.2, 0.8), 0.2); // Magenta tint

        // Add glow and mouse effect
        color += mouseGlow;
        color = clamp(color, 0.0, 1.0);

        // Final output
        gl_FragColor = vec4(color, 1.0);
      }
    `
    })
}