const textureLoader = new THREE.TextureLoader();
            textureLoader.load(shader.baseImage, (texture) => {
                material.uniforms.uTexture = { value: texture };      
            });  