let isAnalyzing = false; // Flag to track if analysis is active
let intervalId;           // Variable to store the interval ID for stopping the process
let dominantFrequencyHistory = []; // Array to store dominant frequencies over time

// Create the checkbox
const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.id = "analyzeToggle";

// Create a label for the checkbox
const label = document.createElement("label");
label.htmlFor = "analyzeToggle";
label.textContent = "Enable Audio Analysis";

// Append the checkbox and label to the body (or any other container)
document.body.appendChild(checkbox);
document.body.appendChild(label);

// Add an event listener to handle start/stop analysis
checkbox.addEventListener("change", (event) => {
    isAnalyzing = event.target.checked;

    // Start or stop analysis based on checkbox state
    if (isAnalyzing) {
        startAnalysis();
    } else {
        stopAnalysis();
    }
});

function startAnalysis() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Access the microphone stream
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            // Set up the interval to analyze sound
            intervalId = setInterval(() => analyzeSound(analyser, dataArray, bufferLength, audioContext), 100); // Every 100 ms
        })
        .catch(error => console.error("Microphone access denied:", error));
}

function stopAnalysis() {
    clearInterval(intervalId); // Stop the interval
    dominantFrequencyHistory = []; // Clear the history
    console.log("Analysis stopped.");
}

function analyzeSound(analyser, dataArray, bufferLength, audioContext) {
    if (!isAnalyzing) return; // Exit if analysis is turned off

    analyser.getByteFrequencyData(dataArray);
    analyser.getByteTimeDomainData(dataArray);

    // Calculate Amplitude
    const amplitude = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    console.log("Amplitude:", amplitude);

    // Get Dominant Frequency
    const dominantFrequency = getDominantFrequency(analyser, dataArray, audioContext);

    // Store the dominant frequency in the history for the last 2 seconds (20 intervals)
    dominantFrequencyHistory.push(dominantFrequency);
    if (dominantFrequencyHistory.length > 20) {
        dominantFrequencyHistory.shift(); // Remove the oldest entry to keep history to 2 seconds
    }

    // Calculate the average dominant frequency over the last 2 seconds
    const avgDominantFrequency = dominantFrequencyHistory.reduce((a, b) => a + b, 0) / dominantFrequencyHistory.length;
    console.log("Average Dominant Frequency (Last 2 seconds):", avgDominantFrequency);

    // 6-Band Frequency Analysis
    const bands = 6;
    const bandWidth = Math.floor(bufferLength / bands);
    let bandAmplitudes = [];

    for (let i = 0; i < bands; i++) {
        const start = i * bandWidth;
        const end = start + bandWidth;
        const bandAverage = dataArray.slice(start, end).reduce((a, b) => a + b, 0) / bandWidth;
        bandAmplitudes.push(bandAverage);
    }

    console.log("6-Band Frequency Amplitudes:", bandAmplitudes);
}

function getDominantFrequency(analyser, dataArray, audioContext) {
    analyser.getByteFrequencyData(dataArray);
    let maxIndex = 0;
    for (let i = 1; i < dataArray.length; i++) {
        if (dataArray[i] > dataArray[maxIndex]) {
            maxIndex = i;
        }
    }
    const dominantFrequency = maxIndex * audioContext.sampleRate / analyser.fftSize;
    console.log("Dominant Frequency:", dominantFrequency);
    return dominantFrequency;
}
