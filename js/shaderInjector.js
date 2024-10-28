import { shaders } from './shadersList.js';

const elementMap = {}; // Store unique configurations for each element selector

export function injectShaderToElement(shader, elementSelector) {
    if (!shader) return;

    const targetElement = document.querySelector(elementSelector);
    if (!targetElement) {
        console.warn(`Element ${elementSelector} not found.`);
        return;
    }

    // Initialize or retrieve the stored configuration for the specified element
    if (!elementMap[elementSelector]) {
        elementMap[elementSelector] = {
            canvas: document.createElement('canvas'),
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, window.innerWidth / targetElement.clientHeight, 0.1, 1000),
            renderer: null,
            currentPlane: null,
        };

        const { canvas, camera } = elementMap[elementSelector];
        canvas.id = `${elementSelector}-canvas`;
        targetElement.appendChild(canvas);

        const renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, targetElement.clientHeight);
        elementMap[elementSelector].renderer = renderer;

        camera.position.z = 1;

        window.addEventListener('resize', () => resize(elementSelector));
    }

    const { scene, renderer, camera, currentPlane } = elementMap[elementSelector];

    // Dispose of the current plane’s material if it exists
    if (currentPlane) {
        currentPlane.material.dispose();
        scene.remove(currentPlane);
    }

    // Create or update the plane with the new shader material
    const geometry = new THREE.PlaneGeometry(20, 2);
    elementMap[elementSelector].currentPlane = new THREE.Mesh(geometry, shader.material);
    scene.add(elementMap[elementSelector].currentPlane);

    // Animate the shader with a time-based effect
    function animate(time) {
        if (shader.material.uniforms && shader.material.uniforms.time) {
            shader.material.uniforms.time.value = time * 0.001;
        }
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Resize handler to adjust renderer and camera on window resize
    function resize(selector) {
        const { renderer, camera, currentPlane } = elementMap[selector];
        const targetElement = document.querySelector(selector);
        const targetHeight = targetElement.clientHeight;

        renderer.setSize(window.innerWidth, targetHeight);
        camera.aspect = window.innerWidth / targetHeight;
        camera.updateProjectionMatrix();

        const newHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * 4;
        const newWidth = newHeight * camera.aspect * 0.333;
        currentPlane.geometry.dispose();
        currentPlane.geometry = new THREE.PlaneGeometry(newWidth, newHeight);
    }

    // Call resize initially to set up the correct dimensions
    resize(elementSelector);
}

// Usage examples
injectShaderToElement(shaders[0], 'header'); // Injects shader into header
injectShaderToElement(shaders[5], 'main');  // Injects shader into main
injectShaderToElement(shaders[2], 'footer'); // Injects shader into footer
