let shaders = [];
let currentLang;
let currentIndex = 0;
let asSounds = false;
let displayInfos = true ;
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
        } else if(explanationToLoad === 'builder') {
            let shaderBuilder = (await import('./EmptyDefault.js')).default ;

            console.log(shaderBuilder) ;
            console.log(shaderBuilder.material) ;
            shaders = [shaderBuilder] ;
            displayInfos = false ;
        }

        if(displayInfos)
            await generateHTML();
        else
            await generateHTML();

        addInteractions();

        managedPagination();
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

    if (canvas) {
        canvas.remove();
    }

    const scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvas = renderer.domElement;
    canvasContainer.appendChild(canvas);

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

    if(!titleSection) {
        console.log("no title section found") ;
        return ;
    }

    titleSection.textContent = shader.name;

    if (currentLang === 'ENG') {
        explanationElement.value = shader.explanationENG;
    } else if (currentLang === 'FR') {
        explanationElement.value = shader.explanationFR;
    }

}

async function loadShader(index) {
    const shader = shaders[index];

    if(displayInfos)
        setInformations(shader);

    console.log("Loading shader:", shader.material);

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
let presentingShaderSection;
let fragmentCodeElement;
let vertexCodeElement;
let jsCodeElement;
let previousButton;
let nextButton;

async function generateHTML() {
    await loadHTML("./parts/fullPresentation.html", "main-placeholder");
    titleElement = document.getElementById("currentTitle");
    explanationElement = document.getElementById("explanation");
    presentingShaderSection = document.getElementById("presentingShader");
    fragmentCodeElement = document.getElementById("fragmentCode");
    vertexCodeElement = document.getElementById("vertexCode");
    jsCodeElement = document.getElementById("jsCode");
    previousButton = document.getElementById("previousButton");
    nextButton = document.getElementById("nextButton");

    const fullscreenButton = document.createElement('button');
    fullscreenButton.classList.add('fullscreen-option');
    fullscreenButton.addEventListener('click', () => toggleFullscreen());
    presentingShaderSection.appendChild(fullscreenButton);
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

let isFullScreen = false;

function toggleFullscreen() {

    if (!isFullScreen) {
        isFullScreen = true;

        // Save the current size of the canvas before fullscreen
        const originalWidth = renderer.domElement.clientWidth;
        const originalHeight = renderer.domElement.clientHeight;

        canvas.requestFullscreen().then(() => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }).catch((err) => {
            console.error(`Error attempting to enter fullscreen mode: ${err.message} (${err.name})`);
        });

        // Save original dimensions for restoring later
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

            }).catch((err) => {
                console.error(`Error attempting to exit fullscreen mode: ${err.message} (${err.name})`);
            });
        } else {
            console.log('Not in fullscreen mode, no need to exit.');
        }
    }
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
    } else {
        if (canvasContainer) {
            toggleFullscreen();
        }
    }
});