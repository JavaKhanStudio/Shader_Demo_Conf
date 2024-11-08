function animate(time) {
    if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value = time * 0.001;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}