import { shaders } from './explanationsShaderMaterials/explanationList.js';

document.addEventListener("DOMContentLoaded", function() {
    let currentIndex = 0;

    const titleElement = document.getElementById("currentTitle");
    const explanationElement = document.getElementById("explanation");
    const fragmentCodeElement = document.getElementById("fragmentCode");
    const vertexCodeElement = document.getElementById("vertexCode");
    const previousButton = document.getElementById("previousButton");
    const nextButton = document.getElementById("nextButton");

    let currentLang = "ENG" ; 

    function loadShader(index) {
        const shader = shaders[index];

        setInformations(shader) ;

        fragmentCodeElement.innerHTML = shader.material.fragmentShader;
        vertexCodeElement.innerHTML = shader.material.vertexShader;
        
        renderShader(shader.material);
        
        // Update button states
        previousButton.disabled = index === 0;
        nextButton.disabled = index === shaders.length - 1;
    }

    function setInformations(shader) {
        titleElement.textContent = shader.name;

        if(currentLang === 'ENG') {
            explanationElement.value = shader.explanationENG;
        } else if(currentLang === 'FR') {
            explanationElement.value = shader.explanationFR;
        }

    }

    // Render the shader in the "presentingShader" div (optional visualization)
    function renderShader(material) {
        const presentingShaderDiv = document.getElementById("presentingShader");
        presentingShaderDiv.innerHTML = ''; // Clear any existing renderer

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, presentingShaderDiv.clientWidth / presentingShaderDiv.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(presentingShaderDiv.clientWidth, presentingShaderDiv.clientHeight);
        presentingShaderDiv.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(9, 5);
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        camera.position.z = 5;

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        function animate(time) {
            if (material.uniforms && material.uniforms.time) {
                material.uniforms.time.value = time * 0.001;
            }
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();

        function resizeHandler() {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', resizeHandler);
    }


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

    loadShader(currentIndex);


});
