import '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

let video;
let canvas;
let ctx;
let model;
let isDrawing = false;
let currentColor = '#4F46E5';
let currentTool = 'brush';
let brushSize = 4;

async function setupCamera() {
  video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
  });
  video.srcObject = stream;
  
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

function setupCanvas() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 480;
  
  // Set initial canvas style
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function updateBrushStyle() {
  ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
  ctx.lineWidth = currentTool === 'eraser' ? brushSize * 2 : brushSize;
}

async function detectHands() {
  const predictions = await model.estimateHands(video);
  
  if (predictions.length > 0) {
    const index = predictions[0].annotations.indexFinger[3];
    const thumb = predictions[0].annotations.thumb[3];
    const distance = Math.sqrt(
      Math.pow(thumb[0] - index[0], 2) + Math.pow(thumb[1] - index[1], 2)
    );
    
    // Draw if index finger and thumb are close
    if (distance < 50) {
      if (!isDrawing) {
        ctx.beginPath();
        ctx.moveTo(index[0], index[1]);
        isDrawing = true;
      } else {
        updateBrushStyle();
        ctx.lineTo(index[0], index[1]);
        ctx.stroke();
      }
    } else {
      isDrawing = false;
    }
  }
  
  requestAnimationFrame(detectHands);
}

async function init() {
  // Only initialize if we're on the drawing page
  if (!document.getElementById('video')) return;
  
  try {
    await setupCamera();
    model = await handpose.load();
    setupCanvas();
    
    // Setup buttons
    document.getElementById('clearBtn').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    document.getElementById('saveBtn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = canvas.toDataURL();
      link.click();
    });
    
    detectHands();
  } catch (error) {
    console.error('Error initializing:', error);
  }
}

// Initialize the application
init();