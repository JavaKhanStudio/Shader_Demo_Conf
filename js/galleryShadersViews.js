import { injectShaderToElement } from './shaderInjector.js';

const gridContainer = document.createElement('div');
gridContainer.classList.add('shader-grid');
document.querySelector('main').appendChild(gridContainer);

const itemsPerPage = 6;
let currentPage = 0;
let activeShaderViews = [];
let shaders = [];

let panelWidth = 0;
let panelHeight = 0;

let simpleShaderCard;

export async function loadShaders(shaderCategory) {

    console.log("loading shader : " + shaderCategory);
    try {
        if (shaderCategory === 'extern') {
            const module = await import('./externShaderMaterials/ZShadersList.js');
            shaders = module.shaders;
        } else if (shaderCategory === 'AI') {
            const module = await import('./aiMadeShaderMaterials/ZShadersList.js');
            shaders = module.shaders;
        } else if (shaderCategory === 'style') {
            const module = await import('./styleShaderMaterials/ZShaderList.js');
            shaders = module.shaders;
        }


        if (!simpleShaderCard) {
            simpleShaderCard = await loadHTML("./parts/simpleShaderCard.html");
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

let holdingInnerWidth;
let holdingInnerHeight;

function createShaderView(shader) {


    let newCard = simpleShaderCard.cloneNode(true);
    console.log("shader", shader, "newCard", newCard);
    const canvasWrapper = newCard.getElementsByClassName("shader-item")[0];

    const canvas = newCard.getElementsByTagName('canvas')[0];
    const title = newCard.getElementsByClassName("shader-name")[0];
    title.textContent = shader.name;

    const applyIt = newCard.getElementsByClassName("apply-text")[0];
    applyIt.textContent = "Apply it";

    // Building And Adding the buttons for greater simplicity
    const buttonContainer = newCard.getElementsByClassName("button-container")[0];
    ['header', 'main', 'footer'].forEach(area => {
        const button = document.createElement('button');
        button.classList.add(`${area}-icon`);
        button.addEventListener('click', (event) => {
            event.preventDefault();
            injectShaderToElement(shader, area);
        });
        buttonContainer.appendChild(button);
    });

    const fullscreenButton = newCard.getElementsByClassName("shader-title")[0].getElementsByClassName('fullscreen-btn')[0];
    fullscreenButton.addEventListener('click', () => toggleFullscreen(canvas, camera, renderer));

    gridContainer.appendChild(newCard);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    let renderer;
    if (shader.translucide) {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: false });
        renderer.setClearColor(0x000000, 0);
        shader.material.blending = THREE.NormalBlending;
        camera.near = 0.1;
        camera.far = 1000;
        camera.updateProjectionMatrix();
    } else {
        renderer = new THREE.WebGLRenderer({ canvas });
    }

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    holdingInnerWidth = canvas.clientWidth;
    holdingInnerHeight = canvas.clientHeight;
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(12, 8);
    const plane = new THREE.Mesh(geometry, shader.material);
    scene.add(plane);

    let animationFrameId;
    let disposed = false;

    function animate(time) {
        if (disposed) return;

        // Set iTime cause i am lazy
        if (shader.material.uniforms && shader.material.uniforms.iTime) {
            shader.material.uniforms.iTime.value = time * 0.001;
        }
        if (shader.material.uniforms && shader.material.uniforms.time) {
            shader.material.uniforms.time.value = time * 0.001;
        }
        if (shader.material.uniforms && shader.material.uniforms.iResolution) {
            shader.material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1.0);
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
    resizeHandler();
    function resizeHandler() {
        if (disposed) return;

        if (fullRenderer === renderer) {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
        } else {
            renderer.setSize(newCard.clientWidth, newCard.clientHeight / 2);
            camera.aspect = newCard.clientWidth / (newCard.clientHeight / 2);
        }



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

let isFullScreen = false;
let fullCanvas;
let fullCamera;
let fullRenderer


function toggleFullscreen(canvas, camera, renderer) {


    if (!isFullScreen) {
        isFullScreen = true;

        // Save the current size of the canvas before fullscreen
        const originalWidth = renderer.domElement.clientWidth;
        const originalHeight = renderer.domElement.clientHeight;

        fullCanvas = canvas;
        fullCamera = camera;
        fullRenderer = renderer;

        console.log(renderer);

        canvas.requestFullscreen().then(() => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }).catch((err) => {
            console.error(`Error attempting to enter fullscreen mode: ${err.message} (${err.name})`);
        });

        canvas.dataset.originalWidth = originalWidth;
        canvas.dataset.originalHeight = originalHeight;

    } else {
        isFullScreen = false;

        const originalWidth = parseInt(canvas.dataset.originalWidth, 10);
        const originalHeight = parseInt(canvas.dataset.originalHeight, 10);

        renderer.setSize(originalWidth, originalHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.aspect = originalWidth / originalHeight;
        camera.updateProjectionMatrix();


        if (document.fullscreenElement) {
            document.exitFullscreen().then(() => {
                window.dispatchEvent(new Event('resize'));
            }).catch((err) => {
                console.error(`Error attempting to exit fullscreen mode: ${err.message} (${err.name})`);
            });
        } else {

        }

    }
}

async function loadHTML(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }

        let htmlString = await response.text();
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstElementChild;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
    } else {
        if (fullCanvas) {
            toggleFullscreen(fullCanvas, fullCamera, fullRenderer);
            fullCanvas = null;
            fullCamera = null;
            fullRenderer = null;
        }
    }
});
