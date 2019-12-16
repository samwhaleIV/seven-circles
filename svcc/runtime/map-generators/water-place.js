import TileBridge from "../tile-bridge.js";
import LayerBridge from "../layer-bridge.js";
import GetWaterBackground from "../../../../elven-engine/renderers/components/world/water-background.js";
import IslandMaker from "../island-maker.js";
import Decorator from "../decorator.js";

const objects = {};
const bridge = new TileBridge(objects);

bridge.import(IslandMaker);

bridge.addDynamicObject(
    "beach_island",
    bridge.getIslandGrid,
    bridge.getIslandGridMeta(454,646,393)
);

bridge.addDynamicObject(
    "beach_ball",
    bridge.getRandom,{
        tiles: [
            713,714,715,
            777,778,779
        ],
        width: 1, height: 1
    }
);

const BALL_COLLISION = 8;
const ISLAND_GROUND = 519;

function WaterPlace(layers) {

    const layerBridge = new LayerBridge(layers,bridge);
    const {decorate, logic} = new Decorator(layerBridge);

    IslandMaker.create({
        layerBridge: layerBridge,
        width: this.map.width,
        height: this.map.height,
        settings: {
            minWidth: 3,
            minHeight: 3,
            maxWidth: 5,
            maxHeight: 4,
            fill: 0.9
        },
        name: "beach_island",
        toBackground: true
    });

    decorate({
        qualifier: logic.backgroundEquals(ISLAND_GROUND),
        fill: 1 / 2,
        stamp: {
            name: "beach_ball",
            collisionType: BALL_COLLISION,
            toForeground: true   
        }
    });

    layers.iterate(data=>{
        if(!data.background) {
            data.collision = 1;
        }
    });

    const startPosition = this.getStartPosition();
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

export default WaterPlace;

