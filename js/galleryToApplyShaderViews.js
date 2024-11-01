import { shaders } from './toApplyShaderList.js';

const gridContainer = document.createElement('div');
gridContainer.classList.add('painter-shader-grid');
document.querySelector('main').appendChild(gridContainer);

function createShaderView(shader) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('shader-item');
    
    const canvas = document.createElement('canvas');
    canvas.classList.add('painter-canvas');
    const title = document.createElement('h2');
    title.textContent = shader.name;

    canvasWrapper.appendChild(canvas);
    canvasWrapper.appendChild(title);

    checkForIntensity();

    gridContainer.appendChild(canvasWrapper);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(6, 6);

    // Load an image texture and apply it to the shader material
    const textureLoader = new THREE.TextureLoader();
    console.log(shader.baseImage);
    textureLoader.load(shader.baseImage, (texture) => {
        shader.material.uniforms.uTexture = { value: texture };

        const plane = new THREE.Mesh(geometry, shader.material);
        scene.add(plane);

        function animate(time) {
            if (shader.material.uniforms.time) {
                shader.material.uniforms.time.value = time * 0.001;
            }

            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        animate();
    });

    window.addEventListener('resize', () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    });

    function checkForIntensity() {
        if (shader.material.uniforms.intensity) {
            const intensityLabel = document.createElement('label');
            intensityLabel.textContent = "Intensity:";
            intensityLabel.style.display = 'block';

            const intensitySlider = document.createElement('input');
            let baseIntensity = shader.material.uniforms.intensity.value ; 
            intensitySlider.type = 'range';
            intensitySlider.min = 0;
            intensitySlider.max = baseIntensity * 2;
            intensitySlider.step = (baseIntensity * 2) / 100;
            intensitySlider.value = baseIntensity;

            intensitySlider.addEventListener('input', () => {
                shader.material.uniforms.intensity.value = parseFloat(intensitySlider.value);
            });

            canvasWrapper.appendChild(intensityLabel);
            canvasWrapper.appendChild(intensitySlider);
        }
    }
}

shaders.forEach(shader => createShaderView(shader));
