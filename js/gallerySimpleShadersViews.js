import { shaders } from './simpleShadersList.js';
import { injectShaderToElement } from './shaderInjector.js';

const gridContainer = document.createElement('div');
gridContainer.classList.add('shader-grid');
document.querySelector('main').appendChild(gridContainer);

function createShaderView(shader) {
    // Create the container for each shader item
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('shader-item');
    
    // Create the canvas element for rendering the shader
    const canvas = document.createElement('canvas');
    canvasWrapper.appendChild(canvas);

    // Add title and apply buttons
    const title = document.createElement('h2');
    title.textContent = shader.name;
    const applyIt = document.createElement('h3');
    applyIt.textContent = "Apply it";
    const buttonContainer = document.createElement('div');

    // Create buttons for each target area
    ['header', 'main', 'footer'].forEach(area => {
        const button = document.createElement('button');
        button.classList.add(`${area}-icon`);
        button.addEventListener('click', (event) => {
            event.preventDefault();
            injectShaderToElement(shader, area);
        });
        buttonContainer.appendChild(button);
    });

    // Append everything to the shader item container
    canvasWrapper.appendChild(title);
    canvasWrapper.appendChild(applyIt);
    canvasWrapper.appendChild(buttonContainer);
    gridContainer.appendChild(canvasWrapper);

    // Three.js setup for this canvas
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(9, 5);
    const plane = new THREE.Mesh(geometry, shader.material);
    scene.add(plane);

    // Create a new renderer for each canvas
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Animation loop for the specific canvas
    function animate(time) {
        if (shader.material.uniforms.time) {
            shader.material.uniforms.time.value = time * 0.001;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // Resize handling for the canvas
    function resizeCanvas() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    // Adjust size initially and on window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// Create each shader view with its own canvas and renderer
shaders.forEach(shader => createShaderView(shader));
