export default {
    name: 'Image Gray',
    explanationFR: `Une image en noir et blanc.

- On lit la couleur de l'image avec texture2D.
- La moyenne (r + g + b) / 3.0 donne un gris.
- vec3(grayscale) met ce gris dans le rouge, le vert et le bleu ; color.a garde la transparence d'origine.`,
    explanationENG: `An image in black and white.

- Read the image's colour with texture2D.
- The average (r + g + b) / 3.0 gives a gray.
- vec3(grayscale) puts that gray in red, green and blue; color.a keeps the original transparency.`,
    baseImage: './images/syn/youngSitting.jpg',
    material: new THREE.ShaderMaterial({
        uniforms: {
            uTexture: {value: null},
            time: {value: 0.0}
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
      uniform sampler2D uTexture;
      uniform float time;

      void main() {
      
        vec4 color = texture2D(uTexture, vUv);

        float grayscale = (color.r + color.g + color.b) / 3.0;
        color = vec4(vec3(grayscale), color.a);
        
        gl_FragColor = color;
      }
    `
    })
}
