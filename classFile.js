class Tools{
    constructor(name,coordinates,action){
        try{
            this.name=name;
            if(name==="erasor" || name=="shape" || name=="undo" || name=="redo" || name=="brush" || name=="clearCanvas" || name=="brushSize" || name=="color"){}
            else{throw "The tool by this name does not exist.";}
            this.coordinates=coordinates;
            this.action=action;
        }
        catch(error){
            console.error("Exception Error in Tool: " + error);
        }
    }
    reset(){
        if(this.name=="redo" || this.name=="undo"){
            this.action["isActive"]=false;
        }
        else if(this.name=="shape"){
            this.action["shape"]="";
            this.action.left=null;
            this.action.top=null;
            this.action.x=null;
            this.action.y=null;
        }
    }
    runFunctionality(){
        try{
        if(this.name=="redo" || this.name=="undo"){
            if(!this.action["isActive"]){
                this.action["method"]();
                this.action["isActive"]=true;
            }
            else{
                this.action["isActive"]=true;
            }
        }
        else if(this.name=="brush" || this.name=="erasor" || this.name=="clearCanvas"){
            this.action["method"]();
        }
        // else if(this.name=="erasor"){
        //     this.action["method"]();
        // }
        // else if(this.name=="clearCanvas"){
        //     this.action["method"]();
        // }
        }
        catch(error){
            console.error("Exception Error in Tool: " + error);
        }
    }
   
}
class Cursor{
  
    constructor(x,y,Tool,isHover){
        this.x=x;
        this.y=y;
        this.mode="move";
        this.currentTool=Tool;
        this.isHover=false;
    }
    setCoordinates(x,y){
        this.x=x;
        this.y=y;
    }
    
    setMode(x,y){
        let a=this.x-x;
        let b = this.y-y;
        if(Math.sqrt(a*a + b*b)<=50){
            this.mode="move";
        }
        else{
            this.mode="select";
        }
    }
    setCurrentTool(tool){this.currentTool=tool;}
}
export {Cursor , Tools};