import { injectShaderToElement } from './shaderInjector.js';

const gridContainer = document.createElement('div');
gridContainer.classList.add('shader-grid');
document.querySelector('main').appendChild(gridContainer);

const itemsPerPage = 6;
let currentPage = 0;
let activeShaderViews = [];
let shaders = [];

export async function loadShaders(shaderCategory) {
    try {
        if (shaderCategory === 'simple') {
            const module = await import('./simpleShaderMaterials/ZsimpleShadersList.js');
            shaders = module.shaders;
        } else if (shaderCategory === 'style') {
            const module = await import('./styleShaderMaterials/ZStyleShaderList.js');
            shaders = module.shaders;
        }
        prepareShaders(currentPage);
    } catch (error) {
        console.error('Failed to load shaders:', error);
    }
}

function prepareShaders(currentPage) {
    if (window.innerWidth <= 768) {
        createPaginationControls();
        renderShaders(currentPage);
    } else {
        shaders.forEach(shader => createShaderView(shader));
    }
}

function renderShaders(page) {
    activeShaderViews.forEach(view => view.dispose());
    activeShaderViews = [];

    gridContainer.innerHTML = '';
    const start = page * itemsPerPage;
    const end = Math.min(start + itemsPerPage, shaders.length);

    for (let i = start; i < end; i++) {
        const shaderView = createShaderView(shaders[i]);
        activeShaderViews.push(shaderView);
    }
}

function createShaderView(shader) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('shader-item');
   
    const canvas = document.createElement('canvas');
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

    canvasWrapper.appendChild(canvas);
    canvasWrapper.appendChild(title);
    canvasWrapper.appendChild(applyIt);
    canvasWrapper.appendChild(buttonContainer);
    gridContainer.appendChild(canvasWrapper);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(9, 5);
    const plane = new THREE.Mesh(geometry, shader.material);
    scene.add(plane);

    let animationFrameId;
    let disposed = false;

    function animate(time) {
        if (disposed) return;
        if (shader.material.uniforms && shader.material.uniforms.time) {
            shader.material.uniforms.time.value = time * 0.001;
        }
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    function resizeHandler() {
        if (disposed) return;
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resizeHandler);

    function dispose() {
        disposed = true;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resizeHandler);

        if (plane.material) {
            if (plane.material.uniforms && plane.material.uniforms.texture) {
                plane.material.uniforms.texture.value.dispose();
            }
            plane.material.dispose();
        }

        plane.geometry.dispose();
        scene.remove(plane);
        renderer.dispose();

        if (canvasWrapper.parentElement) {
            canvasWrapper.parentElement.removeChild(canvasWrapper);
        }
    }

    return { dispose };
}

function createPaginationControls() {
    const paginationContainerTop = document.createElement('div');
    paginationContainerTop.classList.add('pagination-controls');

    const paginationContainerBottom = paginationContainerTop.cloneNode(false); 

    const prevButtonTop = document.createElement('button');
    prevButtonTop.classList.add('previous');
    prevButtonTop.textContent = 'Previous';

    const nextButtonTop = document.createElement('button');
    nextButtonTop.classList.add('next');
    nextButtonTop.textContent = 'Next';

    const prevButtonBottom = prevButtonTop.cloneNode(true);
    const nextButtonBottom = nextButtonTop.cloneNode(true);

    [prevButtonTop, prevButtonBottom].forEach(button => {
        button.addEventListener('click', () => {
            currentPage = Math.max(0, currentPage - 1);
            renderShaders(currentPage);
            setButtonState();
        });
    });

    [nextButtonTop, nextButtonBottom].forEach(button => {
        button.addEventListener('click', () => {
            currentPage = Math.min(Math.ceil(shaders.length / itemsPerPage) - 1, currentPage + 1);
            renderShaders(currentPage);
            setButtonState();
        });
    });

    paginationContainerTop.appendChild(prevButtonTop);
    paginationContainerTop.appendChild(nextButtonTop);
    paginationContainerBottom.appendChild(prevButtonBottom);
    paginationContainerBottom.appendChild(nextButtonBottom);

    const mainElement = document.querySelector('main');
    mainElement.prepend(paginationContainerTop);
    mainElement.appendChild(paginationContainerBottom);

    setButtonState();

    function setButtonState() {
        const disablePrev = currentPage === 0;
        const disableNext = currentPage >= Math.ceil(shaders.length / itemsPerPage) - 1;

        [prevButtonTop, prevButtonBottom].forEach(button => button.disabled = disablePrev);
        [nextButtonTop, nextButtonBottom].forEach(button => button.disabled = disableNext);
    }
}


