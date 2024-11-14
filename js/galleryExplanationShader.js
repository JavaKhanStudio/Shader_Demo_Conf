let shaders = [];
let currentLang;
let currentIndex = 0;
export async function loadExplanations(explanationToLoad, currentLangSelect = "ENG", selectedPage = 0) {
    currentLang = currentLangSelect;
    currentIndex = selectedPage;
    try {
        if (explanationToLoad === 'basics') {
            const module = await import('./explanationsShaderMaterials/explanationList.js');
            shaders = module.shaders;
        } else if (explanationToLoad === 'music') {
            const module = await import('./explanationsSoundsShadersMaterials/soundsExplanationList.js');
            shaders = module.shaders;
        }

        generateHTML();
        addInteractions();
        loadShader(currentIndex);
    } catch (error) {
        console.error('Failed to load shaders:', error);
    }
}




function addInteractions() {
    document.addEventListener("DOMContentLoaded", function () {
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
    });


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
    titleElement.textContent = shader.name;

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
        const code = await response.text();
        jsCodeElement.innerHTML = code;
        jsCodeElement.removeAttribute('display');
    } else {
        jsCodeElement.innerHTML = "";
        jsCodeElement.setAttribute('display', 'none');
    }

    renderShader(shader);

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

function generateHTML() {
    // Create top section
    const topSection = document.createElement("div");
    topSection.id = "topSection";

    // Previous button
    previousButton = document.createElement("button");
    previousButton.id = "previousButton";
    previousButton.textContent = "<- Previous";
    topSection.appendChild(previousButton);

    // Title section
    titleElement = document.createElement("div");
    titleElement.id = "titleSection";

    const currentTitle = document.createElement("h2");
    currentTitle.id = "currentTitle";
    currentTitle.textContent = "Title";
    titleElement.appendChild(currentTitle);

    const explanationList = document.createElement("div");
    explanationList.id = "explanationList";
    titleElement.appendChild(explanationList);

    topSection.appendChild(titleElement);

    // Next button
    nextButton = document.createElement("button");
    nextButton.id = "nextButton";
    nextButton.textContent = "Next ->";
    topSection.appendChild(nextButton);

    // Create shader and explanation section
    const shaderAndExplanation = document.createElement("div");
    shaderAndExplanation.id = "shaderAndExplanation";

    // Explanation section
    const explanationSection = document.createElement("div");
    explanationSection.id = "explanationSection";
    explanationSection.classList.add("compartement");

    const explanationHeading = document.createElement("h2");
    explanationHeading.textContent = "Code Explanation";
    explanationSection.appendChild(explanationHeading);

    explanationElement = document.createElement("textarea");
    explanationElement.id = "explanation";
    explanationSection.appendChild(explanationElement);

    shaderAndExplanation.appendChild(explanationSection);

    // Presenting shader
    const presentingShader = document.createElement("div");
    presentingShader.id = "presentingShader";
    shaderAndExplanation.appendChild(presentingShader);

    // Data points section
    const dataPointsSection = document.createElement("div");
    dataPointsSection.classList.add("compartement");

    const dataPointsHeading = document.createElement("h2");
    dataPointsHeading.textContent = "Data Points";
    dataPointsSection.appendChild(dataPointsHeading);

    const dataPointsContent = document.createElement("div");
    dataPointsSection.appendChild(dataPointsContent);

    shaderAndExplanation.appendChild(dataPointsSection);

    // Fragment section
    const fragmentSection = document.createElement("div");
    fragmentSection.id = "framentSection";
    fragmentSection.classList.add("compartement");

    const fragmentHeading = document.createElement("h2");
    fragmentHeading.textContent = "Fragment Code";
    fragmentSection.appendChild(fragmentHeading);

    const fragmentCodePre = document.createElement("pre");
    fragmentCodeElement = document.createElement("code");
    fragmentCodeElement.id = "fragmentCode";
    fragmentCodeElement.classList.add("language-glsl");
    fragmentCodePre.appendChild(fragmentCodeElement);
    fragmentSection.appendChild(fragmentCodePre);

    shaderAndExplanation.appendChild(fragmentSection);

    // Vertex section
    const vertexSection = document.createElement("div");
    vertexSection.id = "vertexSection";
    vertexSection.classList.add("compartement");

    const vertexHeading = document.createElement("h2");
    vertexHeading.textContent = "Vertex Code";
    vertexSection.appendChild(vertexHeading);

    const vertexCodePre = document.createElement("pre");
    vertexCodeElement = document.createElement("code");
    vertexCodeElement.id = "vertexCode";
    vertexCodeElement.classList.add("language-glsl");
    vertexCodePre.appendChild(vertexCodeElement);
    vertexSection.appendChild(vertexCodePre);

    shaderAndExplanation.appendChild(vertexSection);

    // JavaScript section
    const jsSection = document.createElement("div");
    jsSection.id = "jsSection";
    jsSection.classList.add("compartement");

    const jsHeading = document.createElement("h2");
    jsHeading.textContent = "Javascript Code";
    jsSection.appendChild(jsHeading);

    const jsCodePre = document.createElement("pre");
    jsCodeElement = document.createElement("code");
    jsCodeElement.id = "jsCode";
    jsCodeElement.classList.add("language-javascript");
    jsCodePre.appendChild(jsCodeElement);
    jsSection.appendChild(jsCodePre);

    shaderAndExplanation.appendChild(jsSection);

    // Append sections to the document
    const mainSection = document.querySelector('main')
    mainSection.appendChild(topSection);
    mainSection.appendChild(shaderAndExplanation);
}



