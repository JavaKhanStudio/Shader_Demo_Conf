export default {
    name: 'Mouse Show Precise',
    explanationFR: `Même shader, souris précise.

Le plan ne remplit pas tout le canvas et la caméra a une perspective : la position sur le canvas n'est pas la position sur le plan.
- Le code Javascript ci-dessous lance un rayon (Raycaster) depuis la caméra à travers la souris.
- Le point où ce rayon touche le plan est ramené entre 0.0 et 1.0, dans le même espace que vUv.
Le projecteur tombe maintenant exactement sous la souris.`,
    explanationENG: `Same shader, precise mouse.

The plane does not fill the canvas and the camera has perspective: a position on the canvas is not a position on the plane.
- The Javascript code below casts a ray (Raycaster) from the camera through the mouse.
- The point where that ray hits the plane is brought back between 0.0 and 1.0, the same space as vUv.
The spotlight now lands exactly under the mouse.`,
    baseImage: './images/syn/youngSitting.jpg',
    preciseMouse: true,
    codeJS: "./js/explanationsShaderMaterials/jsCodeExplain/07_02_MouseComplex.js",
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
