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