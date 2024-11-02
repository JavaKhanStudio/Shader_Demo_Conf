import { shaders } from './simpleShadersList.js';
import { injectShaderToElement } from './shaderInjector.js';

const MAX_RENDERERS = 10; // Limit to a safe number of WebGL contexts
const activeRenderers = new Map(); // Track active shaders

// Create a container for the shader grid
const gridContainer = document.createElement('div');
gridContainer.classList.add('shader-grid');
document.querySelector('main').appendChild(gridContainer);

function createShaderView(shader) {
    // Create DOM structure for each shader item
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('shader-item');

    // Canvas element for shader rendering
    const canvas = document.createElement('canvas');
    canvasWrapper.appendChild(canvas);

    // Shader title and buttons
    const title = document.createElement('h2');
    title.textContent = shader.name;
    const applyIt = document.createElement('h3');
    applyIt.textContent = "Apply it";
    const buttonContainer = document.createElement('div');

    // Create buttons for each area (header, main, footer)
    ['header', 'main', 'footer'].forEach(area => {
        const button = document.createElement('button');
        button.classList.add(`${area}-icon`);
        button.addEventListener('click', (event) => {
            event.preventDefault();
            injectShaderToElement(shader, area);
        });
        buttonContainer.appendChild(button);
    });

    // Append all elements to the shader item container
    canvasWrapper.appendChild(title);
    canvasWrapper.appendChild(applyIt);
    canvasWrapper.appendChild(buttonContainer);
    gridContainer.appendChild(canvasWrapper);

    // Three.js setup for each shader
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(9, 5);
    const plane = new THREE.Mesh(geometry, shader.material);
    scene.add(plane);

    // Create renderer and link it to the canvas
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Animation loop with visibility check
    function animate(time) {
        if (!activeRenderers.has(canvasWrapper)) return; // Stop if no longer active

        // Update shader time uniform if present
        if (shader.material.uniforms.time) {
            shader.material.uniforms.time.value = time * 0.001;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    // Resize handler for responsive layout
    function resizeCanvas() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    // Intersection observer to manage active shaders
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!activeRenderers.has(canvasWrapper) && activeRenderers.size < MAX_RENDERERS) {
                    activeRenderers.set(canvasWrapper, { renderer, scene, camera });
                    animate(); // Start animation
                }
            } else {
                activeRenderers.delete(canvasWrapper); // Stop and free up space
            }
        });
    });

    // Observe each shader item for visibility
    observer.observe(canvasWrapper);

    // Resize handling
    window.addEventListener('resize', resizeCanvas);
}

// Create all shader views
shaders.forEach(shader => createShaderView(shader));
