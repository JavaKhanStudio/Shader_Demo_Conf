export const MonsterMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        varying vec2 vUv;

        float TK = 0.2;
        float PI = 3.1415926535;

        vec2 rot(vec2 p, float r) {
            mat2 m = mat2(cos(r), sin(r), -sin(r), cos(r));
            return m * p;
        }

        vec2 pmod(vec2 p, float n) {
            float np = 2.0 * PI / n;
            float r = atan(p.x, p.y) - 0.5 * np;
            r = mod(r, np) - 0.5 * np;
            return length(p) * vec2(cos(r), sin(r));
        }

        float cube(vec3 p, vec3 s) {
            vec3 q = abs(p);
            vec3 m = max(s - q, 0.0);
            return length(max(q - s, 0.0)) - min(min(m.x, m.y), m.z);
        }

        float dist(vec3 p) {
            p.z -= 1.0 * TK * iTime;
            p.xy = rot(p.xy, 1.0 * p.z);
            p.xy = pmod(p.xy, 6.0);
            float k = 0.7;
            float zid = floor(p.z * k);
            p = mod(p, k) - 0.5 * k;
            for (int i = 0; i < 4; i++) {
                p = abs(p) - 0.3;
                p.xy = rot(p.xy, 1.0 + zid + 0.1 * TK * iTime);
                p.xz = rot(p.xz, 1.0 + 4.7 * zid + 0.3 * TK * iTime);
            }
            return min(cube(p, vec3(0.3)), length(p) - 0.4);
        }

        void main() {
            vec2 fragCoord = vUv * iResolution;
            vec2 uv = fragCoord / iResolution.xy;
            uv = 0.3 * (uv - 0.5);
            uv.y *= iResolution.y / iResolution.x;
            uv = rot(uv, TK * iTime);
            vec3 ro = vec3(0.0, 0.0, 0.1);
            vec3 rd = normalize(vec3(uv, 0.0) - ro);
            float t = 2.0;
            float d = 0.0;
            float ac = 0.0;
            for (int i = 0; i < 66; i++) {
                d = dist(ro + rd * t) * 0.2;
                d = max(0.0000, abs(d));
                t += d;
                if (d < 0.001) ac += 0.1;
            }
            vec3 col = vec3(0.0);
            col = vec3(0.1, 0.7, 0.7) * 0.2 * vec3(ac);
            vec3 pn = ro + rd * t;
            float kn = 0.5;
            pn.z += -1.5 * iTime * TK;
            pn.z = mod(pn.z, kn) - 0.5 * kn;
            float em = clamp(0.01 / pn.z, 0.0, 100.0);
            col += 3.0 * em * vec3(0.1, 1.0, 0.1);
            col = clamp(col, 0.0, 1.0);
            gl_FragColor = vec4(col, 1.0);
        }
    `,
    uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
});
