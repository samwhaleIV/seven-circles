import TileBridge from "../tile-bridge.js";

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

bridge.addDynamicObject("floor",bridge.get3x3Grid,bridge.get9GridMeta(67));


function PinkPlace(layers) {
    this.map.backgroundColor = "white";
    function drawFloor(x,y,width,height) {
        layers.background.applyGrid(x,y,objects.floor.getGrid(width,height));
    }
    function drawHorizontalFence(x,y,length) {
        const gridGroup = bridge.getGridGroup([
            null,
            objects.horizontal_fence.getGrid(length),
            new Array(length).fill(1)
        ]);
        layers.applyHorizontalGrid(x,y,gridGroup,gridGroup.filter);
    }

    function drawVerticalFence(x,y,length) {
        const gridGroup = bridge.getGridGroup([
            null,
            objects.vertical_fence.getGrid(length),
            new Array(length).fill(1)
        ]);
        layers.applyVerticalGrid(x,y,gridGroup,gridGroup.filter);
    }

    function drawForegroundObject(objectName,x,y,collisionType=1) {
        let object;
        if(typeof objectName === "object") {
            object = objectName;
        } else {
            object = objects[objectName];
        }
        const gridGroup = bridge.getGridGroup([
            null,
            object,
            bridge.getObject(
                object.width,
                object.height,
                collisionType
            )
        ]);
        layers.applyGrid(x,y,gridGroup,gridGroup.filter);
    }

    function drawCenterHeart(x,y,...parameters) {
        drawForegroundObject("center_heart",x,y,...parameters);
    }

    function drawHeart(x,y,backgroundOffset,...parameters) {
        drawForegroundObject(objects.heart.offset(0,0).offset(backgroundOffset,0),x,y,...parameters);
    }



    drawFloor(2,2,10,6);

    drawHorizontalFence(3,2,20);

    drawVerticalFence(5,6,10);

    const heartCollisionType = 10;

    drawHeart(5,5,2,heartCollisionType);

    this.map.WorldState = function(world) {
        this.load = () => {
            world.addPlayer(1,1);
        }
        this.worldClicked = type => {
            if(type === heartCollisionType) {
                world.say("I love you, Raven. Vvvvvvvvvvvvvv much.");
            }
        }
    }

    if(this.withLighting) {
        //generate lighting information?
    }
}

export default PinkPlace;
