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

const INVALID_FENCE_TYPE = "Invalid fence type";

function PinkPlace(layers) {
    this.map.backgroundColor = "white";

    const layerBridge = new LayerBridge(layers,bridge);

    function drawFloor({x,y,width,height}) {
        layerBridge.stamp({
            name: "floor",
            toBackground: true,
            x: x,
            y: y,
            width: width,
            height: height
        });
    }
    function drawHorizontalFence({x,y,width}) {
        layerBridge.stamp({
            name: "horizontal_fence",
            toForeground: true,
            x: x,
            y: y,
            width: width,
            collisionType: COLLISION_BASIC
        });
    }

    function drawVerticalFence({x,y,height}) {
        layerBridge.stamp({
            name: "vertical_fence",
            toForeground: true,
            x: x,
            y: y,
            height: height,
            collisionType: COLLISION_BASIC
        });
    }
    function drawFence({x,y,width,height}) {
        let method;
        if(width && height) {
            throw Error(INVALID_FENCE_TYPE);
        } else if(width) {
            method = drawHorizontalFence;
        } else if(height) {
            method = drawVerticalFence;
        } else {
            throw Error(INVALID_FENCE_TYPE);
        }
        method.call(null,{
            x: x,
            y: y,
            width: width,
            height: height
        });
    }

    function drawCenterHeart({x,y,collisionType}) {
        layerBridge.stamp({
            name: "center_heart",
            toForeground: true,
            x: x,
            y: y,
            collisionType: collisionType
        });
    }

    function drawHeart({x,y,backgroundOffset=0}) {
        layerBridge.stamp({
            name: "heart",
            toBackground: true,
            x: x,
            y: y,
            xOffset: backgroundOffset,
            collisionType: HEART_COLLISION
        });
    }

    drawFloor({
        x: 2, y: 2,
        width: 10, height: 6
    });
    drawFence({
        x: 3,
        y: 2,
        width: 20
    });
    drawFence({
        x: 5,
        y: 6,
        height: 10
    });
    drawHeart({
        x: 5,
        y: 5,
        backgroundOffset: 2
    });

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
