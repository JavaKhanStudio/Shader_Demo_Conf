import { shaders } from './simpleShadersList.js';
import { injectShaderToElement } from './shaderInjector.js';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const MAX_RENDERERS = isMobile ? 5 : 10;

const activeRenderers = new Map();

const gridContainer = document.createElement('div');
gridContainer.classList.add('shader-grid');
document.querySelector('main').appendChild(gridContainer);

function createShaderView(shader) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('shader-item');

    const canvas = document.createElement('canvas');
    canvasWrapper.appendChild(canvas);

    const title = document.createElement('h2');
    title.textContent = shader.name;
    const applyIt = document.createElement('h3');
    applyIt.textContent = "Apply it";
    const buttonContainer = document.createElement('div');

    ['header', 'main', 'footer'].forEach(area => {
        const button = document.createElement('button');
        button.classList.add(`${area}-icon`);
        button.addEventListener('click', (event) => {
            event.preventDefault();
            injectShaderToElement(shader, area);
        });
        buttonContainer.appendChild(button);
    });

    canvasWrapper.appendChild(title);
    canvasWrapper.appendChild(applyIt);
    canvasWrapper.appendChild(buttonContainer);
    gridContainer.appendChild(canvasWrapper);

    let renderer, scene, camera;

    function initializeRenderer() {
        // Reinitialize the scene, camera, and renderer if needed
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 4;

        const geometry = new THREE.PlaneGeometry(9, 5);
        const plane = new THREE.Mesh(geometry, shader.material);
        scene.add(plane);

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setPixelRatio(isMobile ? 0.5 : window.devicePixelRatio);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    initializeRenderer();

    function animate(time) {
        if (!activeRenderers.has(canvasWrapper)) return;

        if (shader.material.uniforms.time) {
            shader.material.uniforms.time.value = time * 0.001;
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    function resizeCanvas() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    // Context Lost and Restore Event Handling
    canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault(); // Prevent default to allow context restoration
        activeRenderers.delete(canvasWrapper); // Mark this renderer as inactive
    });

    canvas.addEventListener('webglcontextrestored', () => {
        initializeRenderer(); // Reinitialize the renderer and scene
        if (checkVisibility()) {
            activeRenderers.set(canvasWrapper, { renderer, scene, camera });
            animate();
        }
    });

    // Visibility checking logic
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!activeRenderers.has(canvasWrapper) && activeRenderers.size < MAX_RENDERERS) {
                    if (!renderer) initializeRenderer(); // Initialize if needed
                    activeRenderers.set(canvasWrapper, { renderer, scene, camera });
                    animate();
                }
            } else {
                activeRenderers.delete(canvasWrapper);
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 0.1,
    });

    observer.observe(canvasWrapper);

    function checkVisibility() {
        const rect = canvasWrapper.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function visibilityFallback() {
        if (checkVisibility() && !activeRenderers.has(canvasWrapper) && activeRenderers.size < MAX_RENDERERS) {
            if (!renderer) initializeRenderer(); // Initialize if needed
            activeRenderers.set(canvasWrapper, { renderer, scene, camera });
            animate();
        } else {
            activeRenderers.delete(canvasWrapper);
        }
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('resize', visibilityFallback);
    window.addEventListener('scroll', visibilityFallback);
}

// Create shader views
shaders.forEach(shader => createShaderView(shader));
