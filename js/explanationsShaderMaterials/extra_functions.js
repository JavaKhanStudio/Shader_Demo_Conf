export default {
    name: 'Functions',
    explanationFR: '',
    explanationENG: '',
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
