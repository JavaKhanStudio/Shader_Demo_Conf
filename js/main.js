// js/main.js
import { shaders } from './shaders.js';

const gridContainer = document.createElement('div');
gridContainer.classList.add('shader-grid');
document.body.appendChild(gridContainer);

function createShaderView(shader) {
    const canvasWrapper = document.createElement('a');
    canvasWrapper.classList.add('shader-item');
    const canvas = document.createElement('canvas');
    const title = document.createElement('h2');
    title.textContent = shader.name;

    canvasWrapper.appendChild(canvas);
    gridContainer.appendChild(canvasWrapper);
    canvasWrapper.appendChild(title);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(6, 5);
    const plane = new THREE.Mesh(geometry, shader.material);
    scene.add(plane);

    // Animation loop with time-based updates
    function animate(time) {
        if (shader.material.uniforms.time) {
            shader.material.uniforms.time.value = time * 0.001;
        }

        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    });
}

// Loop through shaders and create a view for each one
shaders.forEach(shader => createShaderView(shader));
