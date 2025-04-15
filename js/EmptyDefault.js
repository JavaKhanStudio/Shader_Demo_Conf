export default {
    material: new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 0.0},
            density: {value: 1.5}
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
        uniform float density;
        varying vec2 vUv;
        
        void main() {
            vec3 color = vec3(1,1,1);
            gl_FragColor = vec4(color, 1.0);
        }
    `
    })
}