import { shaders } from './simpleShadersList.js';
import { injectShaderToElement } from './shaderInjector.js';

const gridContainer = document.createElement('div');
gridContainer.classList.add('shader-grid');
document.querySelector('main').appendChild(gridContainer);

function createShaderView(shader) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('shader-item');
    const canvas = document.createElement('canvas');
    const title = document.createElement('h2');
    title.textContent = shader.name;

    const applyIt = document.createElement('h3');
    applyIt.textContent = "Apply it";

    const buttonContainer = document.createElement('div');
    
    const headerButton = document.createElement('button');
    headerButton.classList.add('header-icon')
    headerButton.addEventListener('click', (event) => {
        event.preventDefault();
        injectShaderToElement(shader, 'header');
    });

    const mainButton = document.createElement('button');
    mainButton.classList.add('main-icon')
    mainButton.addEventListener('click', (event) => {
        event.preventDefault();
        injectShaderToElement(shader, 'main');
    });

    const footerButton = document.createElement('button');
    footerButton.classList.add('footer-icon')
    footerButton.addEventListener('click', (event) => {
        event.preventDefault();
        injectShaderToElement(shader, 'footer');
    });

    buttonContainer.appendChild(headerButton);
    buttonContainer.appendChild(mainButton);
    buttonContainer.appendChild(footerButton);

    canvasWrapper.appendChild(canvas);
    gridContainer.appendChild(canvasWrapper);
    canvasWrapper.appendChild(title);
    canvasWrapper.appendChild(applyIt);
    canvasWrapper.appendChild(buttonContainer);



    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(9, 5);
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

    window.addEventListener('resize', () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    });
}

shaders.forEach(shader => createShaderView(shader));
