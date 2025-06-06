export default {
    name: 'Phantom Star',
    description: '',
    author: ' kasari39',
    ref: "https://www.shadertoy.com/view/ttKGDt",
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 0.0},
            iResolution: {value: new THREE.Vector3()}
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
        fragmentShader: `
        precision highp float;

        uniform float time;
        uniform vec3 iResolution;
        varying vec2 vUv;

        // Helper functions
        mat2 rot(float a) {
            float c = cos(a), s = sin(a);
            return mat2(c, s, -s, c);
        }

        const float pi = 3.141592653589793;
        const float pi2 = pi * 2.0;

        vec2 pmod(vec2 p, float r) {
            float a = atan(p.x, p.y) + pi / r;
            float n = pi2 / r;
            a = floor(a / n) * n;
            return p * rot(-a);
        }

        float box(vec3 p, vec3 b) {
            vec3 d = abs(p) - b;
            return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
        }

        float ifsBox(vec3 p) {
            for (int i = 0; i < 5; i++) {
                p = abs(p) - 1.0;
                p.xy *= rot(time * 0.3);
                p.xz *= rot(time * 0.1);
            }
            p.xz *= rot(time);
            return box(p, vec3(0.4, 0.8, 0.3));
        }

        float map(vec3 p, vec3 cPos) {
            vec3 p1 = p;
            p1.x = mod(p1.x - 5.0, 10.0) - 5.0;
            p1.y = mod(p1.y - 5.0, 10.0) - 5.0;
            p1.z = mod(p1.z, 16.0) - 8.0;
            p1.xy = pmod(p1.xy, 5.0);
            return ifsBox(p1);
        }

        void main() {
            vec2 p = (vUv * 2.0 - 1.0) * vec2(iResolution.x / iResolution.y, 1.0);

            vec3 cPos = vec3(0.0, 0.0, -3.0 * time);
            vec3 cDir = normalize(vec3(0.0, 0.0, -1.0));
            vec3 cUp = vec3(sin(time), 1.0, 0.0);
            vec3 cSide = cross(cDir, cUp);

            vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir);

            float acc = 0.0;
            float acc2 = 0.0;
            float t = 0.0;
            for (int i = 0; i < 99; i++) {
                vec3 pos = cPos + ray * t;
                float dist = map(pos, cPos);
                dist = max(abs(dist), 0.02);
                float a = exp(-dist * 3.0);
                if (mod(length(pos) + 24.0 * time, 30.0) < 3.0) {
                    a *= 2.0;
                    acc2 += a;
                }
                acc += a;
                t += dist * 0.5;
            }

            vec3 col = vec3(acc * 0.001, acc * 0.0011 + acc2 * 0.0002, acc * 0.0052 + acc2 * 0.005);
            gl_FragColor = vec4(col, 1.0 - t * 0.03);
        }
    `
    })
}

