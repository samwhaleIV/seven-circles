import TileBridge from "../tile-bridge.js";

const objects = {};
const bridge = new TileBridge(objects);

bridge.addSmallObject("heart",321);
bridge.addSmallObject("eye",385);
bridge.addSmallObject("cake",449);
bridge.addSmallObject("dresser",513);
bridge.addSmallObject("container",517);
bridge.addSmallObject("door",641);
bridge.add4x4Object("center_heart",260);

bridge.addDynamicObject("horizontal_fence",bridge.get3Grid,
    {start:257,middle:258,end:259}
);
bridge.addDynamicObject("vertical_fence",bridge.get3Grid,
    {start:384,middle:448,end:512}
);

bridge.addDynamicObject("floor",bridge.get3x3Grid,bridge.get9GridMeta(67));


function PinkPlace(layers) {
    function drawFloor(x,y,width,height) {
        layers.background.applyGrid(x,y,objects.floor.getGrid(width,height));
    }    
    //Layers is baseData wrapped in a CordHelper (../cord-helper.js)
    this.map.backgroundColor = "white";

    drawFloor(2,2,10,6);

    if(this.withLighting) {
        //generate lighting information?
    }
}

export default PinkPlace;