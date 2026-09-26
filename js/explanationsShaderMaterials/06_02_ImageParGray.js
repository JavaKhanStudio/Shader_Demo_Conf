export default {
    name: 'Image Partly Gray',
    explanationFR: `Seulement une partie en gris.

- blueIntensity = color.b - color.r mesure à quel point un pixel est plus bleu que rouge.
- Au-dessus de 0.3 (le ciel, les tons bleus), le pixel passe en gris.
- Les autres pixels gardent leur couleur.
Chaque pixel décide pour lui-même, d'après sa seule couleur.`,
    explanationENG: `Only part of it in gray.

- blueIntensity = color.b - color.r measures how much bluer than red a pixel is.
- Above 0.3 (the sky, the blue tones) the pixel turns gray.
- Every other pixel keeps its colour.
Each pixel decides for itself, from its own colour alone.`,
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

        float blueIntensity = color.b - color.r;
        if (blueIntensity > 0.3) { 
          float grayscale = (color.r + color.g + color.b) / 3.0;
          color = vec4(vec3(grayscale), color.a);
        } 

        gl_FragColor = color;
      }
    `
    })
}
