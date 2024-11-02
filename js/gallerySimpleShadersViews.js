import { shaders } from './simpleShadersList.js';
import { injectShaderToElement } from './shaderInjector.js';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const MAX_RENDERERS = isMobile ? 5 : 10; // Fewer renderers on mobile

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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(9, 5);
    const plane = new THREE.Mesh(geometry, shader.material);
    scene.add(plane);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setPixelRatio(isMobile ? 0.5 : window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

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

    // Updated IntersectionObserver logic
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!activeRenderers.has(canvasWrapper) && activeRenderers.size < MAX_RENDERERS) {
                    activeRenderers.set(canvasWrapper, { renderer, scene, camera });
                    animate();
                }
            } else {
                activeRenderers.delete(canvasWrapper);
            }
        });
    }, {
        rootMargin: '100px', // Increase margin to catch elements entering/leaving earlier
        threshold: 0.1, // Trigger when at least 10% of the element is visible
    });

    observer.observe(canvasWrapper);

    // Fallback: Manual visibility detection
    function checkVisibility() {
        const rect = canvasWrapper.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        return isVisible;
    }

    function visibilityFallback() {
        if (checkVisibility()) {
            if (!activeRenderers.has(canvasWrapper) && activeRenderers.size < MAX_RENDERERS) {
                activeRenderers.set(canvasWrapper, { renderer, scene, camera });
                animate();
            }
        } else {
            activeRenderers.delete(canvasWrapper);
        }
    }

    // Use fallback for visibility on resize and scroll events
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('resize', visibilityFallback); // Force check visibility on resize
    window.addEventListener('scroll', visibilityFallback); // Fallback for scroll detection
}

// Create shader views
shaders.forEach(shader => createShaderView(shader));
