let model;
let webcamActive = false;
let webcamStream;
let performanceMode = false;

// Load MobileNet
async function loadModel() {
  const resultEl = document.getElementById('result');
  resultEl.innerText = 'Loading model...';
  model = await mobilenet.load();
  resultEl.innerText = 'Model is ready.';
}

loadModel();

// Toggle Webcam Stream
async function toggleWebcam() {
  const videoEl = document.createElement('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  if (!webcamActive) {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: { width: 224, height: 224 } });
      videoEl.srcObject = webcamStream;
      videoEl.play();
      webcamActive = true;
      predictLoop(videoEl);
    } catch (error) {
      alert('Could not access the webcam.');
    }
  } else {
    webcamStream.getTracks().forEach(track => track.stop());
    webcamActive = false;
    clearCanvas();
  }
}

// Performance toggle
function enablePerformanceMode() {
  performanceMode = !performanceMode;
  const status = performanceMode ? 'Performance Optimized.' : 'Standard mode.';
  alert(status);
}

// Clear Canvas Utility
function clearCanvas() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Real-Time Prediction Loop
async function predictLoop(videoEl) {
  const interval = performanceMode ? 300 : 100; // Throttle the predictions
  setInterval(async () => {
    if (webcamActive && model) {
      const ctx = document.getElementById('canvas').getContext('2d');
      ctx.drawImage(videoEl, 0, 0, 224, 224);
      const predictions = await model.classify(document.getElementById('canvas'));
      drawPredictions(predictions);
    }
  }, interval);
}

// Visualize predictions (Heatmap & Overlay)
function drawPredictions(predictions) {
  const ctx = document.getElementById('canvas').getContext('2d');
  if (predictions.length) {
    document.getElementById('result').innerHTML = `
      Prediction: ${predictions[0].className} - ${Math.round(predictions[0].probability * 100)}% confidence.
    `;
    const historyEl = document.getElementById('history');
    historyEl.innerHTML += `<div>${predictions[0].className} (${Math.round(predictions[0].probability * 100)}%)</div>`;
  }
}
