import GraySinScalerMaterial from './graySinScaler.js';
import ScreamerMaterial from './screamer.js';
import ThePuppyMaterial from './thePuppy.js';
import TheWanderer from './theWanderer.js';


export const shaders = [
    {
        name: 'Gray Sin',
        material: GraySinScalerMaterial,
        description: 'Simple Gray scale applyed on image',
        baseImage: './images/toApplyShaderBase/elepantByAI.jpg',
        author: 'Chat GPT',
    },
    {
        name: 'The Puppy',
        material: ThePuppyMaterial,
        description: 'Classic Screamer with some screamy effects',
        baseImage: './images/bebe/1_bebe.jpg',
        optionalImage2:'./images/bebe/1_bebe_central.jpg',
        optionalImage3:'./images/bebe/1_bebe_around.jpg',
    },
    {
        name: 'The Scream',
        material: ScreamerMaterial,
        description: 'Classic Screamer with some screamy effects',
        baseImage: './images/toApplyShaderBase/theScream.jpg',
        author: 'Chat GPT',
    },
    {
        name: 'The Wanderer',
        material: TheWanderer,
        description: '',
        baseImage: './images/toApplyShaderBase/wanderer/frontV2.png',
        optionalImage2: './images/toApplyShaderBase/wanderer/backV2.png',
        author: 'Chat GPT',
    }
]; 