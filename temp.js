import { Cursor , Tools } from "./classFile.js";

const constraints={ 
  video: { width:640 , height:480 } 
};

const video = document.createElement("video");
video.autoplay = true;
const erasor= new Tools("erasor",[1,2,3,4]);
const brush = new Tools("brush",[1,2,3,4]);
const shape=new Tools("shape",[1,2,3,4]);
const undo = new Tools("undo",[1,2,3,4]);
const redo = new Tools("redo",[1,2,3,4]);
const clearCanvas= new Tools("clearCanvas",[1,2,3,4]);
const brushSize=new Tools("size",[1,2,3,4]);

const canvas2= document.getElementById("drawingCanvas");
const ctx2 = canvas2.getContext("2d");
canvas2.height=constraints["video"].height;
canvas2.width=constraints["video"].width;
const cursorElement=document.getElementById("svg-container");
const cursor=new Cursor(0,0,[],brush);
// let model;
// let isDrawing = false;
// let currentColor = '#4F46E5';
// let currentTool = 'brush';
// let brushSize = 4;

const Icons=[];

fetch("icons/cursor0.svg")
.then(response => response.text())
.then(data => {
   Icons[0]=data;
   
}).catch(error => console.error("Error loading SVG:", error));
fetch("icons/brush.svg")
.then(response => response.text())
.then(data => {
    Icons[1] = data;
})
.catch(error => console.error("Error loading SVG:", error));


navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  video.srcObject = stream;
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  
  
  let lastSent = Date.now();
  function sendFrame() {
      if (Date.now() - lastSent < 60) {
          requestAnimationFrame(sendFrame);
          return;
      }
      lastSent = Date.now();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
      
      canvas.toBlob((blob) => {
          if(!blob){return;}
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
              fetch("http://localhost:3000/frame", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ image: reader.result }),
              });
          };
      }, "image/jpeg");

      requestAnimationFrame(sendFrame);
  }
  sendFrame();
}).catch((error) => {console.log("Webcam Error : "+ error)});

function setCursorElement(x,y){
  cursorElement.style.top=y+"px";
  cursorElement.style.left=x+"px";
}
function setcursorIcon(){
  if(cursor.mode=="move"){
      cursorElement.innerHTML = Icons[0];
  }
  else if(cursor.mode=="select"){
      cursorElement.innerHTML="";
      cursorElement.innerHTML = Icons[1];
      
  }
}

function fetchData() {
  fetch("http://localhost:3000/coordinates")
  .then((res) => res.json())
      .then((data) => {
          console.log("Javascript Console: " + data.data);
          let arr= data.data.split(",");
          cursor.setCoordinates(arr[0],arr[1]);
          setCursorElement(cursor.x,cursor.y);
          let x=arr[2];
          let y=arr[3];
          cursor.setMode(x,y);
          setcursorIcon();
      })
      .catch((error) => {
          console.log(" JavaScript catch: " + error);
      });
}
setInterval(fetchData,10)



// async function setupCamera() {
//   video = document.getElementById('video');
//   const stream = await navigator.mediaDevices.getUserMedia({
//     video: { width: 640, height: 480 },
//   });
//   video.srcObject = stream;
  
//   return new Promise((resolve) => {
//     video.onloadedmetadata = () => {
//       resolve(video);
//     };
//   });
// }

// function setupCanvas() {
//   canvas = document.getElementById('canvas');
//   ctx = canvas.getContext('2d');
//   canvas.width = 640;
//   canvas.height = 480;
  
//   // Set initial canvas style
//   ctx.strokeStyle = currentColor;
//   ctx.lineWidth = brushSize;
//   ctx.lineCap = 'round';
//   ctx.lineJoin = 'round';
// }

// function updateBrushStyle() {
//   ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
//   ctx.lineWidth = currentTool === 'eraser' ? brushSize * 2 : brushSize;
// }

// async function detectHands() {
//   const predictions = await model.estimateHands(video);
  
//   if (predictions.length > 0) {
//     const index = predictions[0].annotations.indexFinger[3];
//     const thumb = predictions[0].annotations.thumb[3];
//     const distance = Math.sqrt(
//       Math.pow(thumb[0] - index[0], 2) + Math.pow(thumb[1] - index[1], 2)
//     );
    
//     // Draw if index finger and thumb are close
//     if (distance < 50) {
//       if (!isDrawing) {
//         ctx.beginPath();
//         ctx.moveTo(index[0], index[1]);
//         isDrawing = true;
//       } else {
//         updateBrushStyle();
//         ctx.lineTo(index[0], index[1]);
//         ctx.stroke();
//       }
//     } else {
//       isDrawing = false;
//     }
//   }
  
//   requestAnimationFrame(detectHands);
// }

// async function init() {
//   // Only initialize if we're on the drawing page
//   if (!document.getElementById('video')) return;
  
//   try {
//     await setupCamera();
//     model = await handpose.load();
//     setupCanvas();
    
//     // Setup buttons
//     document.getElementById('clearBtn').addEventListener('click', () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//     });
    
//     document.getElementById('saveBtn').addEventListener('click', () => {
//       const link = document.createElement('a');
//       link.download = 'drawing.png';
//       link.href = canvas.toDataURL();
//       link.click();
//     });
    
//     detectHands();
//   } catch (error) {
//     console.error('Error initializing:', error);
//   }
// }

// // Initialize the application
// init();