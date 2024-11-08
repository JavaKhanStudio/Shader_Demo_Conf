const rect = renderer.domElement.getBoundingClientRect();

const mouseX = (event.clientX - rect.left) / rect.width;
const mouseY = 1.0 - (event.clientY - rect.top) / rect.height;

material.uniforms.mousePosition.value.set(mouseX, mouseY);