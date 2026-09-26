export default {
    name: 'Functions',
    explanationFR: `Les fonctions trigonométriques du GLSL, dessinées.

Le plan est coupé en six bandes : sin (rouge), cos (vert), tan (bleu), puis leurs inverses 1/sin (jaune), 1/cos (magenta), 1/tan (cyan).
- x avance avec time : les courbes défilent.
- plotLine() allume un pixel quand il est proche de la courbe, avec smoothstep pour un bord doux.
- mix() pose la couleur de la courbe sur le fond blanc ; mod() trace les séparations noires.
sin et cos sont les outils de base de toute animation dans un shader.`,
    explanationENG: `GLSL's trigonometric functions, drawn.

The plane is cut into six bands: sin (red), cos (green), tan (blue), then their inverses 1/sin (yellow), 1/cos (magenta), 1/tan (cyan).
- x moves with time: the curves scroll.
- plotLine() lights a pixel when it is close to the curve, with smoothstep for a soft edge.
- mix() lays the curve's colour on the white background; mod() draws the black separators.
sin and cos are the basic tools of every animation in a shader.`,
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 0.0},
            scale: {value: 2.0 * Math.PI} // 2 full oscillations over the x-axis
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
        uniform float scale;
        uniform float time;

        float plotLine(float y, float linePos, float lineWidth) {
            return smoothstep(0.0, lineWidth, lineWidth - abs(y - linePos));
        }

        void main() {
            vec3 color = vec3(1.0); 

            float x = (vUv.x - 0.5) * scale + time;

            float sectionHeight = 1.0 / 6.0;
            float dynamicWidth = 0.01 + 0.005 * sin(time * 2.0); // Dynamic line thickness

            if (vUv.y < sectionHeight) {
                // Sin (Red)
                color = mix(color, vec3(1.0, 0.0, 0.0), plotLine(vUv.y, sectionHeight / 2.0 + sin(x) * 0.07 * sin(time), dynamicWidth));
            } else if (vUv.y < 2.0 * sectionHeight) {
                // Cos (Green)
                color = mix(color, vec3(0.0, 1.0, 0.0), plotLine(vUv.y, sectionHeight * 1.5 + cos(x) * 0.07 * sin(time + 0.5), dynamicWidth));
            } else if (vUv.y < 3.0 * sectionHeight) {
                // Tan (Blue)
                color = mix(color, vec3(0.0, 0.0, 1.0), plotLine(vUv.y, sectionHeight * 2.5 + tan(x) * 0.07 * sin(time + 1.0), dynamicWidth));
            } else if (vUv.y < 4.0 * sectionHeight) {
                // Csc (Yellow)
                color = mix(color, vec3(1.0, 1.0, 0.0), plotLine(vUv.y, sectionHeight * 3.5 + (1.0 / sin(x)) * 0.05 * sin(time + 1.5), dynamicWidth));
            } else if (vUv.y < 5.0 * sectionHeight) {
                // Sec (Magenta)
                color = mix(color, vec3(1.0, 0.0, 1.0), plotLine(vUv.y, sectionHeight * 4.5 + (1.0 / cos(x)) * 0.05 * sin(time + 2.0), dynamicWidth));
            } else {
                // Cot (Cyan)
                color = mix(color, vec3(0.0, 1.0, 1.0), plotLine(vUv.y, sectionHeight * 5.5 + (1.0 / tan(x)) * 0.05 * sin(time + 2.5), dynamicWidth));
            }

            float separatorLineWidth = 0.012;
            if (mod(vUv.y, sectionHeight) < separatorLineWidth) {
                color = vec3(0.0); // Black separator line
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `
    })
}
