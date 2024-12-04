export default new THREE.ShaderMaterial({
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
    #define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
    #define r34(p) fract(29.0 * sin(p.xyzx) * sin(p.yzxx))
    #define P(z, a, b, c, d, e) vec3(sin(z * a) * b, cos(z * c) * d - e, z)

    uniform vec2 iResolution; // Viewport resolution (width, height)
    uniform float iTime;      // Shader playback time (in seconds)

    varying vec2 vUv;

    void main() {
        vec2 u = gl_FragCoord.xy; // Current fragment coordinates
        vec3 p, C;               // Position and color
        float i = 0.0, a = 1.0;  // Iteration and accumulator
        float t = iTime * -0.62; // Adjusted time
        float s;                 // Step value

        vec4 fragColor = vec4(0.0);
        // iResolution = vec2(800.0, 600.0);
        vec2 testReso = vec2(800.0, 450.0) ; 
        // Main rendering loop
        // Was 200 but that would fry most PC
        while (i++ < 100.0) {
            s = a + t;

            // Calculate position
            p = acos(cos(vec3(
                (u + u - testReso.xy) / testReso.y * a / 10.0 *
                rot(t / 18.0) +
                vec2(
                    cos(t * 0.001) - cos(s * 0.001),
                    sin(t * 0.001) - sin(s * 0.001)
                ) * -cos(t * 0.2) / 2.0,
                s
            )));

            // Noise transformation
            int j = 0;
            while (j++ < 2) {
                p = r34(p).xyz;
            }

            // Manipulate coordinates
            p = abs(3.0 * p);
            p = p.x < p.y ? p.zxy : p.zyx;
            p -= vec3(3.0, 1.0, 2.0);

            // Color computation
            C = 0.1 * cos(s * 3.14 / 2.0 + vec3(4.0, 8.0, 16.0));

            // Accumulate brightness
            a += s = abs(length(p.xz) / 38.0 - 0.054) + 0.00002;
            fragColor.rgb += C * C / exp(i * i / 28.0 * s);
        }

        // Ensure final output is normalized
        fragColor.a = 1.0; // Set alpha to fully opaque
        gl_FragColor = fragColor;
    }
  `
});
