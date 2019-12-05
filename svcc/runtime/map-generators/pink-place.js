import TileBridge from "../tile-bridge.js";
import LayerBridge from "../layer-bridge.js";

const objects = {};
const bridge = new TileBridge(objects);

bridge.addSmallObject("heart",321);
bridge.addSmallObject("eye",385);
bridge.addSmallObject("cake",449);
bridge.addSmallObject("dresser",513);
bridge.addSmallObject("container",517);
bridge.addSmallObject("door",641);
bridge.add2x2Object("center_heart",260);

bridge.addDynamicObject("horizontal_fence",bridge.get3Grid,
    {start:257,middle:258,end:259}
);
bridge.addDynamicObject("vertical_fence",bridge.get3Grid,
    {start:384,middle:448,end:512}
);

bridge.addDynamicObject("floor",bridge.get9Grid,bridge.get9GridMeta(67));

const COLLISION_BASIC = 1;
const HEART_COLLISION = 10;

function PinkPlace(layers) {
    this.map.backgroundColor = "white";

    const layerBridge = new LayerBridge(layers,bridge);

    function drawFloor(cords) {
        layerBridge.stampBackgroundDynamic(
            "floor",...bridge.parameterize(cords)
        );
    }
    function drawHorizontalFence(cords) {
        layerBridge.stampHorizontalForeground(
            "horizontal_fence",...bridge.parameterize(cords),COLLISION_BASIC
        );
    }

    function drawVerticalFence(cords) {
        layerBridge.stampVerticalForeground(
            "vertical_fence",...bridge.parameterize(cords),COLLISION_BASIC
        );
    }

    function drawCenterHeart(x,y,collisionType) {
        layerBridge.stampForeground("center_heart",x,y,collisionType);
    }

    function drawHeart(x,y,backgroundOffset) {
        layerBridge.stampBackground("heart",x,y,HEART_COLLISION,backgroundOffset);
    }

    drawFloor({
        x: 2, y: 2,
        width: 10, height: 6
    });
    drawHorizontalFence({
        x: 3,
        y: 2,
        length: 20
    });
    drawVerticalFence({
        x: 5,
        y: 6,
        length: 10
    });

    drawHeart(5,5,2);

    this.map.WorldState = function(world) {
        this.load = () => {
            world.addPlayer(2,2);
        }
        this.worldClicked = type => {
            if(type === HEART_COLLISION) {
                world.say("I love you, Raven. Vvvvvvvvvvvvvv much.");
            }
        }
    }

    if(this.withLighting) {
        //generate lighting information?
    }
}

export default PinkPlace;
