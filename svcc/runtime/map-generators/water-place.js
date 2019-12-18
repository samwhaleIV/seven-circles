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

bridge.addObject("water_heart",526,1,2);
bridge.addObject("water_cake",588,1,1);
bridge.addObject("water_tree",716,1,1);
bridge.addObject("water_pole",589,1,1);
bridge.addObject("water_tree_center",780,2,1);
bridge.addObject("beach_umbrella",585,2,2);

const WATER_OBJECTS = ["water_heart","water_cake","water_tree","water_pole","water_tree_center"];

const BALL_COLLISION = 8;
const ISLAND_GROUND = 519;
const NORMAL_COLLISION = 1;
const NONE = 0;

function DecorateAll(decorate,logic) {

    const IsGround = logic.and(
        logic.backgroundEquals(ISLAND_GROUND),
        logic.collisionEquals(NONE)
    );
    
    const IsWater = logic.and(
        logic.backgroundEquals(NONE),
        logic.foregroundEquals(NONE),
        logic.surrounding(
            logic.foregroundEquals(NONE)
        )
    );

    WATER_OBJECTS.forEach(object => decorate({
        object: object,
        qualifyObjectArea: true,
        qualifier: IsWater,
        fill: 1 / 8,
        stamp: {
            toForeground: true   
        }
    }));

    decorate({
        object: "beach_ball",
        qualifier: IsGround,
        fill: 1 / 16,
        stamp: {
            collisionType: BALL_COLLISION,
            toForeground: true   
        }
    });

    decorate({
        object: "beach_umbrella",
        qualifyObjectArea: true,
        qualifier: IsGround,
        fill: 1 / 16,
        stamp: {
            collisionType: NORMAL_COLLISION,
            toForeground: true   
        }
    });

}

function MakeIslands(layerBridge) {
    IslandMaker.create({
        layerBridge: layerBridge,
        width: this.map.width,
        height: this.map.height,
        settings: {
            minWidth: 4,
            maxWidth: 8,
            minHeight: 4,
            maxHeight: 10,
            fill: 0.9,
            pathFill: 1 / 4
        },
        name: "beach_island",
        toBackground: true
    });
}

function WaterPlace(layers) {
    const layerBridge = new LayerBridge(layers,bridge);
    const {decorate, logic} = new Decorator(layerBridge);

    MakeIslands.call(this,layerBridge);

    DecorateAll(decorate,logic,);

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

