export default {
    name: 'Mouse Show',
    explanationFR: `La souris, injectée comme un uniform.

- Le code Javascript ci-dessous convertit la position de la souris sur le canvas en valeurs entre 0.0 et 1.0 et les écrit dans l'uniform mousePosition (un vec2).
- distance(vUv, mousePosition) mesure l'écart entre le pixel et la souris.
- Plus le pixel est loin, plus on lui retire de lumière : un projecteur suit la souris.
Ici la souris est mesurée sur le canvas entier : le projecteur décale un peu par rapport au plan.`,
    explanationENG: `The mouse, injected as a uniform.

- The Javascript code below turns the mouse position on the canvas into values between 0.0 and 1.0 and writes them into the mousePosition uniform (a vec2).
- distance(vUv, mousePosition) measures how far the pixel is from the mouse.
- The farther the pixel, the more light it loses: a spotlight follows the mouse.
Here the mouse is measured on the whole canvas, so the spotlight drifts a little from the plane.`,
    baseImage: './images/syn/youngSitting.jpg',
    codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/07_01_MouseSimple.js",
    material: new THREE.ShaderMaterial({
        uniforms: {
            uTexture: {value: null},
            time: {value: 0.0},
            mousePosition: {value: new THREE.Vector2(0.5, 0.5)} // Initialize at center
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
          uniform vec2 mousePosition;
    
          void main() {
            vec4 textureColor = texture2D(uTexture, vUv);
            float dist = distance(vUv, mousePosition);    
            gl_FragColor = textureColor - vec4(vec3(dist * 2.2), 0.0);
          }
        `
    })
}
