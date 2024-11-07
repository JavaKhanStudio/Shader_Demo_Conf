import { shaders } from './explanationsShaderMaterials/explanationList.js';

document.addEventListener("DOMContentLoaded", function() {
    let currentIndex = 0;

    const titleElement = document.getElementById("currentTitle");
    const explanationElement = document.getElementById("explanation");
    const fragmentCodeElement = document.getElementById("fragmentCode");
    const vertexCodeElement = document.getElementById("vertexCode");
    const jsCodeElement = document.getElementById("jsCode");
    const previousButton = document.getElementById("previousButton");
    const nextButton = document.getElementById("nextButton");

    let currentLang = "ENG" ; 

    async function loadShader(index) {
        const shader = shaders[index];

        setInformations(shader) ;

        fragmentCodeElement.innerHTML = shader.material.fragmentShader;
        vertexCodeElement.innerHTML = shader.material.vertexShader;

        if(shader.codeJS) {
            const response = await fetch(shader.codeJS);
            if (!response.ok) throw new Error('Failed to load file');
            const code = await response.text();
            jsCodeElement.innerHTML = code;
            jsCodeElement.removeAttribute('display') ;
        } else {
            jsCodeElement.setAttribute('display', 'none') ;
        }
        
        renderShader(shader);
        
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
    let material ; 
    let renderer ; 
    let canvasContainer; 
    let canvas ;
    
    async function renderShader(shader) {
        material = shader.material
        canvasContainer = document.getElementById("presentingShader");
        canvasContainer.innerHTML = ''; // Clear any existing renderer

        canvas = document.querySelector("canvas");

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        canvasContainer.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(9, 6);


        camera.position.z = 5;

        if(shader.baseImage) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(shader.baseImage, (texture) => {
                material.uniforms.uTexture = { value: texture };      
            });  
        } 

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

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
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
        }

        window.addEventListener('resize', resizeHandler);
    }

    document.addEventListener('mousemove', (event) => {
        if (!renderer || !material || !material.uniforms || !material.uniforms.mousePosition) {
            return ; 
        }

        if(material.uniforms.preciseMouse) {
            // Convert mouse position to normalized device coordinates (-1 to +1)
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Update raycaster with camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            // Check for intersection with the plane
            const intersects = raycaster.intersectObject(plane); // `plane` is the mesh created for the shader

            if (intersects.length > 0) {
                // Get intersection point in plane coordinates
                const intersectPoint = intersects[0].point;

                // Map the intersected point to the plane’s UV coordinates
                const planeSize = new THREE.Vector2(9, 6); // Width and height of the plane
                const uvX = (intersectPoint.x + planeSize.x / 2) / planeSize.x;
                const uvY = (intersectPoint.y + planeSize.y / 2) / planeSize.y;

                // Set the mouse position in shader coordinates
                material.uniforms.mousePosition.value.set(uvX, uvY);
            }
        } else {
            const rect = renderer.domElement.getBoundingClientRect();
    
            const mouseX = (event.clientX - rect.left) / rect.width;
            const mouseY = 1.0 - (event.clientY - rect.top) / rect.height;
        
            material.uniforms.mousePosition.value.set(mouseX, mouseY);
        }

        
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

    loadShader(currentIndex);


});
