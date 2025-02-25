class Tools{
    constructor(name,coordinates,action){
        try{
            this.name=name;
            if(name==="erasor" || name=="shape" || name=="undo" || name=="redo" || name=="brush" || name=="clearCanvas" || name=="size"){}
            else{throw "The tool by this name does not exist.";}
            if(coordinates.length!=4){throw "There should be 4 coordinates for Tool."}
        }
        catch(error){
            console.error("Exception Error: " + error);
        }
        this.coordinates=coordinates;
        this.action=action;
    }
}
class Cursor{
  
    constructor(x,y,Image,Tool){
        this.x=x;
        this.y=y;
        this.Images=Image;
        this.mode="move";
        this.tool=Tool;
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
}
export {Cursor , Tools};