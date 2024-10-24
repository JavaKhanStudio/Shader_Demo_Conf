// js/shaders.js

import { GradientShaderMaterial } from './shaderMaterials/gradientShader.js';
import { GradientShaderMovingMaterial } from './shaderMaterials/gradientShaderMovingMaterial.js'; // Example shader

export const shaders = [
    {
        name: 'Gradient Shader',
        material: GradientShaderMaterial,
    },
    {
        name: 'Gradient Moving Shader',
        material: GradientShaderMovingMaterial,
    },

];
