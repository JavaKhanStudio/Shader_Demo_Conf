let shaders = [];
let currentLang;
let currentIndex = 0;
let asSounds = false;
export async function loadExplanations(explanationToLoad) {

    const urlParams = new URLSearchParams(window.location.search);
    currentIndex = parseInt(urlParams.get("page")) || 0;

    // TODO PUT IN SESSION STORAGE
    currentLang = urlParams.get("lang") || "ENG";

    try {
        if (explanationToLoad === 'basics') {
            const module = await import('./explanationsShaderMaterials/explanationList.js');
            shaders = module.shaders;
        } else if (explanationToLoad === 'music') {
            const module = await import('./explanationsSoundsShadersMaterials/soundsExplanationList.js');
            shaders = module.shaders;
            asSounds = true;
        }

        await generateHTML();
        addInteractions();
        managedPagination() ;
        await loadShader(currentIndex);

        if (asSounds) {
            const moduleSounds = await import('./audioInputs.js');
        }


    } catch (error) {
        console.error('Failed to load shaders:', error);
    }
}


function addInteractions() {

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    document.addEventListener('mousemove', (event) => {
        if (!renderer || !material || !material.uniforms || !material.uniforms.mousePosition) {
            return;
        }

        if (currentShader.preciseMouse) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(plane);

            if (intersects.length > 0) {
                // Get intersection point in plane coordinates
                const intersectPoint = intersects[0].point;

                const planeSize = new THREE.Vector2(9, 6);
                const uvX = (intersectPoint.x + planeSize.x / 2) / planeSize.x;
                const uvY = (intersectPoint.y + planeSize.y / 2) / planeSize.y;

                material.uniforms.mousePosition.value.set(uvX, uvY);
            }
        } else {
            const rect = renderer.domElement.getBoundingClientRect();

            const mouseX = (event.clientX - rect.left) / rect.width;
            const mouseY = 1.0 - (event.clientY - rect.top) / rect.height;

            material.uniforms.mousePosition.value.set(mouseX, mouseY);
        }

    });
}

function managedPagination() {
    previousButton.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            loadShader(currentIndex);
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentIndex < shaders.length - 1) {
            currentIndex++;
            loadShader(currentIndex);
        }
    });
}

let material;
let renderer;
let canvasContainer;
let canvas;
let currentShader;
let camera;
let geometry;
let plane;

async function renderShader(shader) {
    currentShader = shader;
    material = shader.material
    canvasContainer = document.getElementById("presentingShader");
    canvasContainer.innerHTML = ''; // Clear any existing renderer

    canvas = document.querySelector("canvas");

    const scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvasContainer.appendChild(renderer.domElement);

    geometry = new THREE.PlaneGeometry(9, 6);


    camera.position.z = 5;

    if (shader.baseImage) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(shader.baseImage, (texture) => {
            material.uniforms.uTexture = { value: texture };
        });
    }

    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    function animate(time) {
        if (material.uniforms && material.uniforms.time) {
            material.uniforms.time.value = time * 0.001;
        }
        if (asSounds && window.AudioAnalysisData) {
            if (material.uniforms.amplitude) {
                material.uniforms.amplitude.value = window.AudioAnalysisData.amplitude;
            }
            if (material.uniforms.dominantFrequency) {
                material.uniforms.dominantFrequency.value = window.AudioAnalysisData.dominantFrequency;
            }
            if (material.uniforms.bandAmplitudes) {
                material.uniforms.bandAmplitudes.value = window.AudioAnalysisData.bandAmplitudes;
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    function resizeHandler() {
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resizeHandler);
}

function setInformations(shader) {
    titleSection.textContent = shader.name;

    if (currentLang === 'ENG') {
        explanationElement.value = shader.explanationENG;
    } else if (currentLang === 'FR') {
        explanationElement.value = shader.explanationFR;
    }

}

async function loadShader(index) {
    const shader = shaders[index];

    setInformations(shader);

    fragmentCodeElement.innerHTML = shader.material.fragmentShader;
    vertexCodeElement.innerHTML = shader.material.vertexShader;

    if (shader.codeJS) {
        const response = await fetch(shader.codeJS);
        if (!response.ok) throw new Error('Failed to load file');

        jsCodeElement.innerHTML = (await response.text()).trim();
        jsCodeElement.removeAttribute('display');
    } else {
        jsCodeElement.innerHTML = "";
        jsCodeElement.setAttribute('display', 'none');
    }

    await renderShader(shader);

    // Update button states
    previousButton.disabled = index === 0;
    nextButton.disabled = index === shaders.length - 1;
}


let titleElement;
let explanationElement;
let fragmentCodeElement;
let vertexCodeElement;
let jsCodeElement;
let previousButton;
let nextButton;

async function generateHTML() {
    await loadHTML("../parts/fullPresentation.html","main-placeholder") ;
    titleElement = document.getElementById("currentTitle");
    explanationElement = document.getElementById("explanation");
    fragmentCodeElement = document.getElementById("fragmentCode");
    vertexCodeElement = document.getElementById("vertexCode");
    jsCodeElement = document.getElementById("jsCode");
    previousButton = document.getElementById("previousButton");
    nextButton = document.getElementById("nextButton");

}

async function loadHTML(filePath, targetElementId) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }

        const html = await response.text();

        const targetElement = document.getElementById(targetElementId);
        if (targetElement) {
            targetElement.innerHTML = html;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}