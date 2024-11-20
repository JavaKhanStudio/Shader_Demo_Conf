import { shaders } from './toApplyShaderMaterials/ZtoApplyShaderList.js';

const gridContainer = document.createElement('div');
gridContainer.classList.add('painter-shader-grid');
document.querySelector('main').appendChild(gridContainer);

function createShaderView(shader) {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.classList.add('shader-item');

    const canvas = document.createElement('canvas');
    canvas.classList.add('painter-canvas');
    const title = document.createElement('h2');
    title.textContent = shader.name;

    canvasWrapper.appendChild(canvas);
    canvasWrapper.appendChild(title);

    checkForIntensity();

    gridContainer.appendChild(canvasWrapper);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.z = 4;

    const geometry = new THREE.PlaneGeometry(6, 6);

    // Load textures dynamically if available
    const textureLoader = new THREE.TextureLoader();
    const texturePaths = [
        shader.baseImage,       // uTexture_1
        shader.optionalImage2,  // uTexture_2 (if exists)
        shader.optionalImage3   // uTexture_3 (if exists)
    ];
    const textureUniformNames = ["uTexture_1", "uTexture_2", "uTexture_3"];

    const loadedTextures = {};
    let texturesToLoad = texturePaths.filter(Boolean).length; // Only count non-null paths

    if (texturesToLoad === 0) {
        initializeShader(); // No textures to load, directly initialize the shader
    } else {
        texturePaths.forEach((path, index) => {
            if (path) {
                textureLoader.load(path, (texture) => {
                    texture.minFilter = THREE.NearestFilter;
                    texture.magFilter = THREE.NearestFilter;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;

                    loadedTextures[textureUniformNames[index]] = { value: texture };
                    texturesToLoad--;

                    if (texturesToLoad === 0) {
                        initializeShader(); // All textures are loaded
                    }
                });
            }
        });
    }

    function initializeShader() {
        // Assign loaded textures to the material's uniforms
        shader.material.uniforms = {
            ...shader.material.uniforms, // Preserve existing uniforms
            ...loadedTextures            // Add dynamically loaded texture uniforms
        };

        const plane = new THREE.Mesh(geometry, shader.material);
        scene.add(plane);

        function animate(time) {
            if (shader.material.uniforms.time) {
                shader.material.uniforms.time.value = time * 0.001;
            }

            requestAnimationFrame(animate);
            renderer.setClearAlpha(0);
            renderer.render(scene, camera);
        }

        animate();
    }

    window.addEventListener('resize', () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    });

    function checkForIntensity() {
        if (shader.material.uniforms.intensity) {
            const intensityLabel = document.createElement('label');
            intensityLabel.textContent = "Intensity:";
            intensityLabel.style.display = 'block';

            const intensitySlider = document.createElement('input');
            let baseIntensity = shader.material.uniforms.intensity.value;
            intensitySlider.type = 'range';
            intensitySlider.min = 0;
            intensitySlider.max = baseIntensity * 2;
            intensitySlider.step = (baseIntensity * 2) / 100;
            intensitySlider.value = baseIntensity;

            intensitySlider.addEventListener('input', () => {
                shader.material.uniforms.intensity.value = parseFloat(intensitySlider.value);
            });

            canvasWrapper.appendChild(intensityLabel);
            canvasWrapper.appendChild(intensitySlider);
        }
    }
}

shaders.forEach(shader => createShaderView(shader));
