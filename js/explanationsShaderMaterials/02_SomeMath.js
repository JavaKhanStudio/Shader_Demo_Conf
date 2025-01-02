export default {
    name: 'Some Math',
    explanationFR: '',
    explanationENG: '',
    material: new THREE.ShaderMaterial({
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: `
        varying vec2 vUv;
        void main() {
          vec3 color;

          bool beetweenY = vUv.y > 0.4 && vUv.y < 0.6 ;
          bool beetweenX = vUv.x > 0.4 && vUv.x < 0.6 ;
          
          if(beetweenX && beetweenY) {
            color = vec3(0, 0, 0);
          } else {
            color = vec3(vUv.y, 0, 1.0 - vUv.x);
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `
    })
}