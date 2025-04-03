import { FlipLeftRight } from "@tensorflow/tfjs";
import { Cursor , Tools } from "./classFile.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const constraints={ 
  video: { width:640 , height:480 } 
};

const video = document.createElement("video");
video.autoplay = true;

const canvas2= document.getElementById("drawingCanvas");
const ctx2 = canvas2.getContext("2d");
canvas2.height=constraints["video"].height;
canvas2.width=constraints["video"].width;
const cursorElement=document.getElementById("svg-container");
const brushElement = document.getElementById("brush");
const brushSizeElement = document.getElementById("brushSize");
const erasorElement = document.getElementById("erasor");
const redoElement = document.getElementById("redo");
const undoElement = document.getElementById("undo");
const clearCanvasElement = document.getElementById("clearCanvas");
const colorElement=document.getElementById("color");
const shapeElement=document.getElementById("shape");
const sizeContainer=document.getElementById("size");
const inputRange=document.getElementById("range");
const colorContainer=document.getElementById("color-container");
const shapeContainer=document.getElementById("shape-container");
const shaper=document.getElementById("shaper");
inputRange.addEventListener("mousedown",(e)=>{e.preventDefault();e.stopImmediatePropagation()})
const toolElementCollection=[
    brushElement,brushSizeElement,erasorElement,redoElement,undoElement,clearCanvasElement,colorElement,shapeElement
];
let toolCoordinatesCollection=[];
let redoStack=[];
let undoStack=[];
toolElementCollection.forEach(tool => {
    let topval=tool.getBoundingClientRect().top-canvas2.getBoundingClientRect().top;
    let bottomval=tool.getBoundingClientRect().bottom-canvas2.getBoundingClientRect().top;
    let rightval=tool.getBoundingClientRect().right-canvas2.getBoundingClientRect().left;
    let leftval=tool.getBoundingClientRect().left-canvas2.getBoundingClientRect().left;
    
    toolCoordinatesCollection.push({top:topval,bottom:bottomval,right:rightval,left:leftval});
});
sizeContainer.style.top=toolCoordinatesCollection[1].top+4+"px";
sizeContainer.style.left=(toolCoordinatesCollection[1].left-160)+"px";


let previousCoordinates=[];
const cursor=new Cursor(0,0);
cursor.mode="select";
function calcDistance(arr1,arr2){
    let x=parseInt(arr1[0])-parseInt(arr2[0]);
    let y=parseInt(arr1[1])-parseInt(arr2[1]);
    return Math.sqrt((x*x) + (y*y));
}
function loadState(url){
    const img= new Image();
    img.src=url;
    img.onload=function(){
        ctx2.clearRect(0,0,canvas2.width,canvas2.height);
        ctx2.drawImage(img,0,0)  
    };
}
let undofunc=function(){
    if(undoStack.length==0){return;}
    let topURL=undoStack[undoStack.length-1];
    loadState(topURL);
    redoStack.push(topURL);
    undoStack.pop();
    // console.log(topURL,undoStack.length)
    console.log("undo done");
};
let redofunc=function(){
    let topURL=redoStack[redoStack.length-1];
    loadState(topURL);
    redoStack.pop();
    undoStack.push(topURL);
    // console.log(topURL)
};

const brushSize=new Tools("brushSize",toolCoordinatesCollection[1],{size:5});

let drawfunc=function(){
    let radius=brushSize.action["size"];
    ctx2.beginPath();
    if(previousCoordinates[0] && calcDistance(previousCoordinates,[cursor.x,cursor.y])<100){
        ctx2.fillStyle=color.action["color"];
        ctx2.arc(cursor.x,cursor.y,radius,0,360);
        ctx2.fill();

        ctx2.beginPath();
        ctx2.strokeStyle=color.action["color"];
        ctx2.lineWidth=2*radius;
        ctx2.moveTo(cursor.x,cursor.y);
        ctx2.lineTo(previousCoordinates[0],previousCoordinates[1]);
        ctx2.stroke();
    }
    else{
        ctx2.fillStyle=color.action["color"];
        ctx2.arc(cursor.x,cursor.y,radius,0,360);
        ctx2.fill();
    }
};
let erasefunc=function(){
    let radius=brushSize.action["size"];
    ctx2.beginPath();
    ctx2.fillStyle="white";
    ctx2.arc(cursor.x,cursor.y,radius,0,360);
    ctx2.fill();
    
    
};
let clearCanvasfunc=function(){

    ctx2.clearRect(0,0,canvas2.width,canvas2.height);
    console.log("Canvas Cleared");
}
const brush = new Tools("brush",toolCoordinatesCollection[0],{method:drawfunc});
const erasor= new Tools("erasor",toolCoordinatesCollection[2],{method:erasefunc});
const color=new Tools("color",toolCoordinatesCollection[6],{color:"black"})
const shape=new Tools("shape",toolCoordinatesCollection[7],{shape:"",left:null,top:null,x:null,y:null});
const redo = new Tools("redo",toolCoordinatesCollection[3],{method:redofunc,isActive:false});
const undo = new Tools("undo",toolCoordinatesCollection[4],{method:undofunc,isActive:false});
const clearCanvas= new Tools("clearCanvas",toolCoordinatesCollection[5],{method:clearCanvasfunc});
const toolCollection=[
    brush,brushSize,erasor,redo,undo,clearCanvas,color,shape
];
cursor.currentTool=brush;
const Icons=[];
// undofunc=function(){console.log("undo done")}
// redofunc=function(){console.log("redo done")}
// redo.action["method"]=redofunc;
// undo.action["method"]=undofunc; 
fetch("icons/cursor0.svg").then(response => response.text()).then(data => {
   Icons[0]=data;
}).catch(error => console.error("Error loading SVG:", error));
fetch("icons/brush.svg").then(response => response.text()).then(data => {
    Icons[1] = data;
}).catch(error => console.error("Error loading SVG:", error));
// fetch("icons/BrushTool.svg").then(response => response.text()).then(data => {
//    brushElement.innerHTML=data;

// }).catch(error => console.error("Error loading SVG:", error));
// fetch("icons/ErasorTool.svg").then(response => response.text()).then(data => {
//     erasorElement.innerHTML=data;
//     erasorElement.children[0].setAttribute("width","90%");
//  }).catch(error => console.error("Error loading SVG:", error));
//  fetch("icons/BrushSizeTool.svg").then(response => response.text()).then(data => {
//     brushSizeElement.innerHTML=data;
//     brushSizeElement.children[0].setAttribute("width","90%");
//  }).catch(error => console.error("Error loading SVG:", error));
//  fetch("icons/ClearCanvaTool.svg").then(response => response.text()).then(data => {
//     clearCanvasElement.innerHTML=data;
//  }).catch(error => console.error("Error loading SVG:", error));
//  fetch("icons/RedoTool.svg").then(response => response.text()).then(data => {
//     redoElement.innerHTML=data;
//  }).catch(error => console.error("Error loading SVG:", error));
//  fetch("icons/UndoTool.svg").then(response => response.text()).then(data => {
//     undoElement.innerHTML=data;
//  }).catch(error => console.error("Error loading SVG:", error));
//  fetch("icons/ColorTool.svg").then(response => response.text()).then(data => {
//     colorElement.innerHTML=data;
//  }).catch(error => console.error("Error loading SVG:", error));
//  fetch("icons/ShapeTool.svg").then(response => response.text()).then(data => {
//     shapeElement.innerHTML=data;
//  }).catch(error => console.error("Error loading SVG:", error));
 let sizeBarCoordinates={
    top:inputRange.getBoundingClientRect().top-canvas2.getBoundingClientRect().top,
    bottom:inputRange.getBoundingClientRect().bottom-canvas2.getBoundingClientRect().top,
    left:inputRange.getBoundingClientRect().left-canvas2.getBoundingClientRect().left,
    right:inputRange.getBoundingClientRect().right-canvas2.getBoundingClientRect().left
};
let colorValuesCoordinates=[]
for(let element of colorContainer.children){
    colorValuesCoordinates.push({
        top:element.getBoundingClientRect().top-canvas2.getBoundingClientRect().top,
        bottom:element.getBoundingClientRect().bottom-canvas2.getBoundingClientRect().top,
        left:element.getBoundingClientRect().left-canvas2.getBoundingClientRect().left,
        right:element.getBoundingClientRect().right-canvas2.getBoundingClientRect().left,
        colorValue:element.id
    })
};
let shapeValuesCoordinates=[];
for(let element of shapeContainer.children){
    shapeValuesCoordinates.push({
        top:element.getBoundingClientRect().top-canvas2.getBoundingClientRect().top,
        bottom:element.getBoundingClientRect().bottom-canvas2.getBoundingClientRect().top,
        left:element.getBoundingClientRect().left-canvas2.getBoundingClientRect().left,
        right:element.getBoundingClientRect().right-canvas2.getBoundingClientRect().left,
        shapeValue:element.id
    });
}

function startWebcam(){
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        
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
}
startWebcam() 
function setCursorElement(x,y){
    cursorElement.style.top=y+"px";
    cursorElement.style.left=x+"px";
}
function setcursorIcon(){
    if(cursor.mode=="move"){
        cursorElement.innerHTML = Icons[0];
    }
    else if(cursor.mode=="select"){
            cursorElement.innerHTML = Icons[1];
    }
}

function checkHover(){
    for(let i=0;i<toolCollection.length;i++){
        let tool=toolCollection[i].coordinates;
        if(cursor.x>tool.left && cursor.x<tool.right && cursor.y>tool.top && cursor.y<tool.bottom){
            if(tool.name=="color"){console.log("color tool")}
            return true;
        }
    }
    return false;
}

function HoveredTool(){
    for(let i=0;i<toolCollection.length;i++){
        let tool=toolCollection[i].coordinates;
        let ans=[toolElementCollection[i],toolCollection[i]];
        if(cursor.x>tool.left && cursor.x<tool.right && cursor.y>tool.top && cursor.y<tool.bottom){
            return ans;
        }
    }
}

function saveDrawingState(){
    if(cursor.currentTool.name=="erasor" || cursor.currentTool.name=="brush"){
    undoStack.push(canvas2.toDataURL());
        console.log("drawing Saved")
    }
}
function setRangeValue(){
    let value=brushSize.action["size"];
    if(cursor.x>sizeBarCoordinates.left && cursor.x<sizeBarCoordinates.right && cursor.y>sizeBarCoordinates.top-10 && cursor.y<sizeBarCoordinates.bottom+10){
        let sliderval=cursor.x-sizeBarCoordinates.left;
        inputRange.value=sliderval+"";
        value=sliderval/5;
    }
    brushSize.action["size"]=value;
}
function setColorValue(){
    
    colorValuesCoordinates.forEach((e)=>{
        if(cursor.x>e.left && cursor.x<e.right && cursor.y>e.top && cursor.y<e.bottom){
            color.action["color"]=e.colorValue;
            return;
        }
    });
}
function setShapeValue(){
    shapeValuesCoordinates.forEach((e)=>{
        if(cursor.x>e.left && cursor.x<e.right && cursor.y>e.top && cursor.y<e.bottom){
            shape.action["shape"]=e.shapeValue;
            return;
        }
    });
    
}
function resizeShape(){
    if(shape.action.x>shape.action.left && shape.action.y>shape.action.top){
        shaper.style.width=(cursor.x-shape.action.left)+"px";
        shaper.style.height=(cursor.y-shape.action.top)+"px";
        if(cursor.currentTool.action.shape=="rectangle"){
            
            shaper.style.boxShadow="0px 0px 0px "+brushSize.action.size+"px "+color.action.color+",inset 0px 0px 0px "+brushSize.action.size+"px "+color.action.color;
        }
        else if(cursor.currentTool.action.shape=="circle"){
            shaper.style.borderRadius="50%";
            shaper.style.boxShadow="0px 0px 0px "+brushSize.action.size+"px "+color.action.color+",inset 0px 0px 0px "+brushSize.action.size+"px "+color.action.color;
        }
    }
    else{
        shaper.style.width="0px";
        shaper.style.height="0px";
        shaper.style.boxShadow="";
    }
    shape.action.x=cursor.x;
    shape.action.y=cursor.y;
}
function drawShape(){
if(shape.action.x>shape.action.left && shape.action.y>shape.action.top){
    if(cursor.currentTool.action.shape=="rectangle"){
        ctx2.beginPath();
        ctx2.strokeStyle=color.action.color;
        ctx2.lineWidth=2*brushSize.action.size;
        ctx2.strokeRect(shape.action.left,shape.action.top,(shape.action.x-shape.action.left),(shape.action.y-shape.action.top));

    }
    else if(cursor.currentTool.action.shape=="circle"){
        ctx2.beginPath();
        ctx2.strokeStyle=color.action.color;
        ctx2.lineWidth=2*brushSize.action.size;
        let x=parseInt(shape.action.x);
        let y=parseInt(shape.action.y);
        let stop=parseInt(shape.action.top);
        let sleft=parseInt(shape.action.left);
        ctx2.ellipse((x+sleft)/2, (y+stop)/2 , (x-sleft)/2, (y-stop)/2,0, 0, 2 * Math.PI); 
        ctx2.stroke();
        
    }
}
}
let isHover=false;
let isSelect=false;
let isSelectTool=false;
let lastHoveredTool;
let currentdate=Date.now();
let shapeFlag=false;
let shapePlacement=false;
function fetchData() {
    fetch("http://localhost:3000/coordinates")
    .then((res) => res.json())
    .then((data) => {
        // console.log("Javascript Console: " + data.data);
        let arr= data.data.split(",");
        if(arr[4]){
            arr[0]=arr[4];
            arr[1]=arr[5];
            arr[2]=arr[6];
            arr[3]=arr[7];
        }
        cursor.setCoordinates(arr[0],arr[1]);
        setCursorElement(cursor.x,cursor.y);
        let x=arr[2];
        let y=arr[3];
        cursor.setMode(x,y);
        setcursorIcon();
        let checkHoverBool=checkHover();
        if(!isSelect && cursor.mode=="select"){
            isSelect=true;
        }
        
        else if(isSelect && !isSelectTool && cursor.mode!="select"){
            if(Date.now()-currentdate>900 && !isHover){
                saveDrawingState();
                currentdate=Date.now();
            }
            isSelect=false;
        }
        if(!isHover && checkHoverBool && cursor.mode!="select"){
            isHover=true;
            lastHoveredTool= HoveredTool();
            lastHoveredTool[0].classList.add("toolHover");
        }
        else if(isHover && !checkHoverBool){
            isHover=false;
            lastHoveredTool[0].classList.remove("toolHover");
        }
        if(!isSelectTool && checkHoverBool && cursor.mode=="select"){
            isSelectTool=true;
            lastHoveredTool= HoveredTool();
            lastHoveredTool[0].classList.add("toolSelect");
        }
        else if(isSelectTool && checkHoverBool && cursor.mode!="select"){
            isSelectTool=false;
            lastHoveredTool[0].classList.remove("toolSelect");
        }
   
  
        if(isHover && cursor.mode=="select"){
            cursor.setCurrentTool(lastHoveredTool[1]);
        }
        else if(!isHover){
            if(cursor.currentTool.name=="clearCanvas" || cursor.currentTool.name=="redo" || cursor.currentTool.name=="undo"){
                cursor.setCurrentTool(brush);
            }
        }
    if(cursor.currentTool.name=="color"){

        colorContainer.style.display="flex";
        shapeContainer.style.display="none";
        sizeContainer.style.display="none";
        if(cursor.mode=="select"){
            setColorValue();   
        }
    }
    else if(cursor.currentTool.name=="shape"){

        if(shapeFlag){
            if(cursor.mode=="select"){
                if(!shapePlacement){
                    shape.action.left=cursor.x;
                    shape.action.top=cursor.y;
                    shapePlacement=true;

                    shaper.style.display="flex";
                    shaper.style.left=shape.action.left+"px";
                    shaper.style.top=shape.action.top+"px";
                }
                else{
                    resizeShape();
                }
            }
            else if(cursor.mode=="move" && shapePlacement){
                drawShape();
                shape.reset();
                shapePlacement=false;
                shapeFlag=false;
                cursor.setCurrentTool(brush);
                shaper.style.height="0px";
                shaper.style.width="0px";
                shaper.style.display="none";
                shaper.style.left="0px";
                shaper.style.top="0px";
                shaper.style.borderRadius="0px";
                saveDrawingState();
            }
         
        }
        else{
      
            sizeContainer.style.display="none";
                colorContainer.style.display="none";
            if(cursor.mode=="select" && shape.action["shape"]==""){
                shapeContainer.style.display="flex";
                setShapeValue();
                
            }
            else if(shape.action["shape"]!="" && cursor.mode=="move"){
                shapeContainer.style.display="none";
                shapeFlag=true;
            }
        }
    }
    else if(cursor.currentTool.name=="brushSize"){

        sizeContainer.style.display="flex";
        colorContainer.style.display="none";
        shapeContainer.style.display="none";
        if(cursor.mode=="select"){
            setRangeValue();
        }
    }
    else{
        sizeContainer.style.display="none";
        colorContainer.style.display="none";
        shapeContainer.style.display="none";
        if(isHover && cursor.mode=="select" && (cursor.currentTool.name=="undo" || cursor.currentTool.name=="redo")){
            if(cursor.currentTool.name=="undo"){
                undo.runFunctionality();
            }
            else if(cursor.currentTool.name=="redo"){
                redo.runFunctionality();
            }
        }
        else if(cursor.mode=="move" && (cursor.currentTool.name=="undo" || cursor.currentTool.name=="redo")){
            undo.reset();
            redo.reset();
        }
        else if(cursor.currentTool.name=="brush" && cursor.mode=="select" && !isSelectTool){
            brush.runFunctionality();
            previousCoordinates=[arr[0],arr[1],arr[2],arr[3]];
        }
        else if(cursor.currentTool.name=="erasor" && cursor.mode=="select" && !isSelectTool){
            erasor.runFunctionality();
        }
        else if(cursor.currentTool.name=="clearCanvas" && cursor.mode=="select" && isHover){
            clearCanvas.runFunctionality();
        }
    }
        })
        .catch((error) => {
            console.log(" JavaScript catch: " + error);
        });
}
setInterval(fetchData,100)

