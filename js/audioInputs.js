let isAnalyzing = false;
let intervalId;
let dominantFrequencyHistory = [];

// Create the checkbox
const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.id = "analyzeToggle";

const label = document.createElement("label");
label.htmlFor = "analyzeToggle";
label.textContent = "Enable Audio Analysis";

let paramsSpace = document.querySelector('#params')
paramsSpace.appendChild(checkbox);
paramsSpace.appendChild(label);

checkbox.addEventListener("change", (event) => {
    isAnalyzing = event.target.checked;
    if (isAnalyzing) {
        startAnalysis();
        window.AudioAnalysisData.micIsOn = true;
    } else {
        stopAnalysis();
    }
});

function startAnalysis() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();

    // Adjust FFT size for better frequency resolution
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3; // Add smoothing to reduce jitter

    const bufferLength = analyser.frequencyBinCount;
    const timeDataArray = new Float32Array(bufferLength); // Use Float32Array for time domain
    const freqDataArray = new Uint8Array(bufferLength);   // Use Uint8Array for frequency domain

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            // Increase sampling rate for more responsive analysis
            intervalId = setInterval(() => analyzeSound(analyser, timeDataArray, freqDataArray, bufferLength, audioContext), 50);
        })
        .catch(error => console.error("Microphone access denied:", error));
}

function stopAnalysis() {
    clearInterval(intervalId);
    dominantFrequencyHistory = [];
    isAnalyzing = false;
    setBasicData();
    console.log("Analysis stopped.");
}

window.AudioAnalysisData = {
    amplitude: 0,
    dominantFrequency: 0,
    bandAmplitudes: [],
    micIsOn: false
};

function setBasicData() {
    window.AudioAnalysisData.amplitude = 0; // Changed from 128 to 0 as default
    window.AudioAnalysisData.dominantFrequency = 0;
    window.AudioAnalysisData.bandAmplitudes = [];
    window.AudioAnalysisData.micIsOn = false;
}

export function analyzeSound(analyser, timeDataArray, freqDataArray, bufferLength, audioContext) {
    if (!isAnalyzing) return;

    // Get both time domain and frequency domain data
    analyser.getFloatTimeDomainData(timeDataArray);  // Use getFloatTimeDomainData instead
    analyser.getByteFrequencyData(freqDataArray);

    // Calculate RMS amplitude from time domain data
    const amplitude = calculateRMS(timeDataArray);
    window.AudioAnalysisData.amplitude = amplitude;


    // Get Dominant Frequency
    const dominantFrequency = getDominantFrequency(analyser, freqDataArray, audioContext);
    window.AudioAnalysisData.dominantFrequency = dominantFrequency;

    // 6-Band Frequency Analysis
    const bands = 6;
    const bandWidth = Math.floor(bufferLength / bands);
    window.AudioAnalysisData.bandAmplitudes = [];

    for (let i = 0; i < bands; i++) {
        const start = i * bandWidth;
        const end = start + bandWidth;
        const bandAverage = freqDataArray.slice(start, end).reduce((a, b) => a + b, 0) / bandWidth;
        window.AudioAnalysisData.bandAmplitudes.push(bandAverage);
    }
}

function calculateRMS(timeDataArray) {
    // Calculate RMS from float time domain data
    const squareSum = timeDataArray.reduce((sum, sample) => sum + sample * sample, 0);
    const rms = Math.sqrt(squareSum / timeDataArray.length);
    return rms;
}

function getDominantFrequency(analyser, dataArray, audioContext) {
    let maxIndex = 0;
    let maxValue = -Infinity;

    // Find the frequency bin with maximum amplitude
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
        }
    }

    const dominantFrequency = maxIndex * audioContext.sampleRate / analyser.fftSize;
    return Math.round(dominantFrequency);
}