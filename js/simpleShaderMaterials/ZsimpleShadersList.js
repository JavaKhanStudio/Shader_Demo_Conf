import { GradientShaderMaterial } from './gradientShader.js';
import { GradientShaderMovingMaterial } from './gradientShaderMoving.js';
import { WavePatternShaderMaterial } from './wavePatternShader.js';
import { CloudNoiseShaderMaterial } from './cloudNoiseShader.js';
import { GoldenSpiralShaderMaterial } from './goldenSpiralShader.js';
import { WaterDanceShaderMaterial } from './waterDanceShader.js';
import { HeaderAmbienceShaderMaterial } from './headerAmbienceShader.js';
import { EnhancedWaterShaderMaterial } from './enhancedWaterShader.js';
import { ShaderArtMaterial } from './shaderArt.js';
import { MonsterMaterial } from './monster.js';
import { TunnelMaterial } from './tunnel.js';
import { TunnelMaterialV2 } from './tunnelV2.js';

import { PhantomStarMaterial } from './phantomStar.js';


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
        name: 'Shader Art',
        material: ShaderArtMaterial,
        description: '',
        author: ' kishimisu ',
        ref: "https://www.shadertoy.com/view/mtyGWy"
    },
    {
        name: 'Monster',
        material: MonsterMaterial,
        description: '',
        author: 'butadiene',
        ref: "https://www.shadertoy.com/view/WtKSzt"
    },
    {
        name: 'Phantom Star',
        material: PhantomStarMaterial,
        description: '',
        author: ' kasari39',
        ref: "https://www.shadertoy.com/view/ttKGDt"
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
