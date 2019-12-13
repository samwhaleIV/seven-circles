import TileBridge from "../tile-bridge.js";
import LayerBridge from "../layer-bridge.js";
import GetWaterBackground from "../../../../elven-engine/renderers/components/world/water-background.js";
import IslandMaker from "../island-maker.js";

const objects = {};
const bridge = new TileBridge(objects);

bridge.import(IslandMaker);

bridge.addDynamicObject(
    "beach_island",
    bridge.getIslandGrid,
    bridge.getIslandGridMeta(454,646,393)
);

const BALL_COLLISION = 8;

bridge.addDynamicObject(
    "beach_ball",
    function(){
        const index = this.tiles[
            Math.floor(Math.random()*this.tiles.length)
        ];
        return bridge.getObject(1,1,index);
    },{
        tiles: [713,714,715,777,778,779]
    }
);

function getStartPosition(layers,width,height) {
    for(let x = 0;x<width;x++) {
    for(let y = 0;y<height;y++) {
        if(!layers.collision.get(x,y)) {
            return {
                x: x,
                y: y
            };
        }
    }}
    return {
        x: 0,
        y: 0
    };
}

function WaterTest(layers) {
    this.map.backgroundColor = "black";

    const layerBridge = new LayerBridge(
        layers,bridge
    );

    const islandMaker = new IslandMaker({
        layerBridge: layerBridge,
        width: this.map.width,
        height: this.map.height,
        settings: {
            minWidth: 3,
            minHeight: 3,
            maxWidth: 5,
            maxHeight: 4,
            fill: 0.9
        }
    });

    islandMaker.generateGrid();
    islandMaker.paint({
        name: "beach_island",
        toBackground: true
    });

    const ballAttempts = 100;

    for(let i = 0;i<ballAttempts;i++) {
        var x = Math.floor(Math.random()*this.map.width);
        var y = Math.floor(Math.random()*this.map.height);
        if(layers.background.get(x,y) === 519) {
            layerBridge.stamp({
                name: "beach_ball",
                x: x,
                y: y,
                collisionType: BALL_COLLISION,
                toForeground: true
            })
        }
    }


    layers.remap(({values,x,y})=>{
        let backgroundValue = values[0];
        let foregroundValue = values[1];
        let collisionValue = values[2];
        if(!backgroundValue) {
            collisionValue = 1;
        }
        values[0] = backgroundValue;
        values[1] = foregroundValue;
        values[2] = collisionValue;
    });

    const startPosition = getStartPosition(
        layers,this.map.width,this.map.height
    );

    this.map.WorldState = function(world) {
        this.load = () => {
            world.addPlayer(startPosition.x,startPosition.y);
        }
        this.worldClicked = type => {
            if(type === BALL_COLLISION) {
                world.say("It's a beach ball.");
            }
        }
    }
    this.map.fxBackground = GetWaterBackground(80,112);
}

export default WaterTest;

