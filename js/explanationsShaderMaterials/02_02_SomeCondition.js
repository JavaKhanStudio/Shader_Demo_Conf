export default {
    name: 'A IF',
    explanationFR: `Un shader accepte des conditions, comme en Javascript.

- beetweenX et beetweenY sont vrais quand le pixel est entre 0.4 et 0.6 sur l'axe.
- Si les deux sont vrais, le pixel est au centre : il devient noir, vec3(0, 0, 0).
- Sinon il garde le dégradé de l'étape précédente.
Attention au typage fort : 0 n'est pas un float, 0.0 en est un.`,
    explanationENG: `A shader accepts conditions, just like Javascript.

- beetweenX and beetweenY are true when the pixel sits between 0.4 and 0.6 on that axis.
- When both are true the pixel is in the centre: it turns black, vec3(0, 0, 0).
- Otherwise it keeps the previous step's gradient.
Mind the strong typing: 0 is not a float, 0.0 is.`,
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