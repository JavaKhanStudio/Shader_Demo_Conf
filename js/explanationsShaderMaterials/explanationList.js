import { BasicMaterial } from './01_Basic.js';
import { SomeMathMaterial } from './02_SomeMath.js';
import { OptimisationMaterial } from './03_Optimisation.js';
import { AddingTimeMaterial } from './04_01_AddingTime.js';
import { PerpectiveTimeMaterial } from './04_02_AddingTimeVertex.js';
import { UsingTextureMaterial } from './05_UsingTexture.js';
import { ImageGrayMaterial } from './06_01_ImageGray.js';
import { ImageWorkMaterial } from './06_02_ImageWork.js';
import { ImageWorkInvertedMaterial } from './06_03_ImageWorkInverted.js';
import { MouseMaterial } from './07_01_Mouse.js';
import { MousePreciseMaterial } from './07_02_MousePrecise.js';




import { TooMuchMaterial } from './extra_TooMuch.js';

export const shaders = [
    {
        name: 'Basic concepts',
        material: BasicMaterial,
        explanationFR: '',
        explanationENG:''
    },
    {
        name: 'Some Math',
        material: SomeMathMaterial,
        explanationFR: '',
        explanationENG:''
    },
    {
        name: 'Optimisation',
        material: OptimisationMaterial,
        explanationFR: '',
        explanationENG:''
    },
    {
        name: 'Adding Time',
        material: AddingTimeMaterial,
        explanationFR: '',
        explanationENG:''
    },
    {
        name: 'Perpective',
        material: PerpectiveTimeMaterial,
        explanationFR: '',
        explanationENG:''
    },
    {
        name: 'Using Texture',
        material: UsingTextureMaterial,
        explanationFR: '',
        explanationENG:'',
        baseImage :'./images/syn/youngSitting.jpg',
        codeJS : "./js/explanationsShaderMaterials/jsCodeExplain/05_texture.js",
    },
    {
        name: 'Image Gray',
        material: ImageGrayMaterial,
        explanationFR: '',
        explanationENG:'',
        baseImage :'./images/syn/youngSitting.jpg',
    },
    {
        name: 'Image Work',
        material: ImageWorkMaterial,
        explanationFR: '',
        explanationENG:'',
        baseImage :'./images/syn/youngSitting.jpg',
    },
    {
        name: 'Image Work Inverted',
        material: ImageWorkInvertedMaterial,
        explanationFR: '',
        explanationENG:'',
        baseImage :'./images/syn/youngSitting.jpg',
    },
    {
        name: 'Mouse Show',
        material: MouseMaterial,
        explanationFR: '',
        explanationENG:'',
        baseImage :'./images/syn/youngSitting.jpg',
    },
    {
        name: 'Mouse Show Precise',
        material: MousePreciseMaterial,
        explanationFR: '',
        explanationENG:'',
        baseImage :'./images/syn/youngSitting.jpg',
    },
    {
        name: 'Too Much',
        material: TooMuchMaterial,
        explanationFR: '',
        explanationENG:'',
        baseImage :'./images/syn/youngSitting.jpg',
    }
]


