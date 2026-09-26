export default {
    name: 'Using Texture',
    explanationFR: `Une image entre dans le shader comme un uniform.

- Le code Javascript ci-dessous charge l'image et la place dans l'uniform uTexture.
- Côté shader, elle est reçue en sampler2D.
- texture2D(uTexture, vUv) lit la couleur de l'image à la position du pixel.
Le pixel prend cette couleur telle quelle : on voit l'image, et on peut maintenant la transformer.`,
    explanationENG: `An image enters the shader as a uniform.

- The Javascript code below loads the image and puts it in the uTexture uniform.
- The shader receives it as a sampler2D.
- texture2D(uTexture, vUv) reads the image's colour at the pixel's position.
The pixel takes that colour as is: the image shows, and can now be transformed.`,
    baseImage: './images/syn/youngSitting.jpg',
    codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/05_texture.js",
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
        void main() {
          vec4 color = texture2D(uTexture, vUv);
          gl_FragColor = color;
        }
      `
    })
}
