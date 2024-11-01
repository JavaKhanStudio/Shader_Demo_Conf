import { GraySinScalerMaterial } from './toApplyShadersMaterials/graySinScaler.js';
import { ScreamerMaterial } from './toApplyShadersMaterials/screamer.js';


export const shaders = [
    {
        name: 'Gray Sin',
        material: GraySinScalerMaterial,
        description: 'Simple Gray scale applyed on image',
        baseImage :'./images/toApplyShaderBase/elepantByAI.jpg',
        author: 'Chat GPT',
    },
    {
        name: 'The Scream',
        material: ScreamerMaterial,
        description: 'Classic Screamer with some screamy effects',
        baseImage :'./images/toApplyShaderBase/theScream.jpg',
        author: 'Chat GPT',
    }
] ; 