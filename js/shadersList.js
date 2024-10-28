import { GradientShaderMaterial } from './shaderMaterials/gradientShader.js';
import { GradientShaderMovingMaterial } from './shaderMaterials/gradientShaderMoving.js';
import { WavePatternShaderMaterial } from './shaderMaterials/wavePatternShader.js';
import { CloudNoiseShaderMaterial } from './shaderMaterials/cloudNoiseShader.js';
import { GoldenSpiralShaderMaterial } from './shaderMaterials/GoldenSpiralShader.js';
import { WaterDanceShaderMaterial } from './shaderMaterials/waterDanceShader.js';
import { HeaderAmbienceShaderMaterial } from './shaderMaterials/headerAmbienceShader.js';
import { EnhancedWaterShaderMaterial } from './shaderMaterials/enhancedWaterShader.js';



export const shaders = [
    {
        name: 'Gradient',
        material: GradientShaderMaterial,
        description: '',
        author: 'Chat GPT',
    },
    {
        name: 'Gradient Moving',
        material: GradientShaderMovingMaterial,
        description: '',
        author: 'Chat GPT',
    },
    {
        name: 'Water Dance',
        material: WaterDanceShaderMaterial,
        author: 'Chat GPT',
    },
    {
        name: 'Enhanced Water',
        material: EnhancedWaterShaderMaterial,
        description: '',
    },
    {
        name: 'Wave Pattern',
        material: WavePatternShaderMaterial,
        description: '',
        author: 'Claude',
    },
    {
        name: 'Cloud Noise',
        material: CloudNoiseShaderMaterial,
        description: "Ethereal cloud formations using Perlin-like noise at different frequencies (fractal Brownian motion), layered together with varying scales and speeds. The monochromatic palette emerges from layering multiple octaves of noise, creating a natural, soft texture that moves like smoke or clouds",
        author: 'Claude',
    },
    {
        name: 'Golden Spiral',
        material: GoldenSpiralShaderMaterial,
        description: "Ethereal cloud formations using Perlin-like noise at different frequencies (fractal Brownian motion), layered together with varying scales and speeds. The monochromatic palette emerges from layering multiple octaves of noise, creating a natural, soft texture that moves like smoke or clouds",
        author: 'Claude',
    },
    {
        name: 'Header Ambience',
        material: HeaderAmbienceShaderMaterial,
        description: "",
        author: 'Claude',
    },

];
