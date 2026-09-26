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

// Why the box unticked itself when the browser refused the mic; cleared on the next check
const micStatus = document.createElement("p");
micStatus.id = "micStatus";
micStatus.setAttribute("role", "status");
paramsSpace.appendChild(micStatus);
// fullPresentation.html hides the section until a page has an interaction to put in it
paramsSpace.closest('.interactionSection').style.display = '';

checkbox.addEventListener("change", (event) => {
    isAnalyzing = event.target.checked;
    if (isAnalyzing) {
        micStatus.textContent = "";
        startAnalysis();
    } else {
        stopAnalysis();
    }
});

// What startAnalysis opened; stopAnalysis closes it, so the browser's mic indicator goes off.
let audioContext;
let micStream;

function startAnalysis() {
    // Made inside the click so the autoplay policy lets it run
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const context = audioContext;
    const analyser = context.createAnalyser();

    // Adjust FFT size for better frequency resolution
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3; // Add smoothing to reduce jitter

    const bufferLength = analyser.frequencyBinCount;
    const timeDataArray = new Float32Array(bufferLength); // Use Float32Array for time domain
    const freqDataArray = new Uint8Array(bufferLength);   // Use Uint8Array for frequency domain

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Unchecked (or checked again) while the browser was asking: this stream is not wanted
            if (!isAnalyzing || context !== audioContext) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }
            micStream = stream;
            const source = context.createMediaStreamSource(stream);
            source.connect(analyser);
            window.AudioAnalysisData.micIsOn = true;

            // Increase sampling rate for more responsive analysis
            intervalId = setInterval(() => analyzeSound(analyser, timeDataArray, freqDataArray, bufferLength, context), 50);
        })
        .catch(error => {
            console.error("Microphone access denied:", error);
            if (context !== audioContext) {
                context.close();
                return;
            }
            checkbox.checked = false;
            stopAnalysis();
            micStatus.textContent = error.name === "NotFoundError"
                ? "No microphone found: plug one in, then tick the box again."
                : "Microphone blocked: allow it in the address bar, then tick the box again.";
        });
}

function stopAnalysis() {
    clearInterval(intervalId);
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
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