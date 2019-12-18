import TileBridge from "../tile-bridge.js";
import LayerBridge from "../layer-bridge.js";
import GetWaterBackground from "../../../../elven-engine/renderers/components/world/water-background.js";
import IslandMaker from "../island-maker.js";
import Decorator from "../decorator.js";

const objects = {};
const bridge = new TileBridge(objects);

bridge.import(IslandMaker);
bridge.addIsland("beach_island",454,646,393);

bridge.addObject("water_heart",526,1,2);
bridge.addObject("water_cake",588,1,1);
bridge.addObject("water_tree",716,1,1);
bridge.addObject("water_pole",589,1,1);
bridge.addObject("water_tree_center",780,2,1);
bridge.addObject("beach_umbrella",585,2,2);
bridge.addObject("water_dome",268,2,2);

bridge.addSelectObject("beach_ball",1,1,[713,714,715,777,778,779]);
bridge.addSelectObject("water_spike",1,2,[398,399]);

const BALL_COLLISION = 8;
const UMBRELLA_COLLISION = 9;
const ISLAND_GROUND = 519;
const NORMAL_COLLISION = 1;
const NONE = 0;

const FLAT = 1;
const DOUBLE = 2;

const COLLISION_MAP = {
    "beach_ball": BALL_COLLISION,
    "beach_umbrella": UMBRELLA_COLLISION
}

const matchNameToCollision = ({name}) => {
    if(name in COLLISION_MAP) {
        return COLLISION_MAP[name];
    } else {
        return NORMAL_COLLISION;
    }
}

const DecorateAll = (_,decorateGroup,{
    and, surrounding, backgroundEquals,collisionEquals, foregroundEquals
}) => {

    const IsGround = and(
        backgroundEquals(ISLAND_GROUND),
        collisionEquals(NONE),
        surrounding(collisionEquals(NONE))
    );
    
    const IsWater = and(
        backgroundEquals(NONE),
        foregroundEquals(NONE),
        surrounding(foregroundEquals(NONE))
    );

    decorateGroup({
        uniformMap: {
            "water_heart": FLAT,
            "water_cake": FLAT,
            "water_tree": FLAT,
            "water_pole": FLAT,
            "water_tree_center": FLAT,
            "water_dome": DOUBLE,
            "water_spike": FLAT
        },
        qualifier: IsWater,
        fill: Infinity,
        stamp: {
            toForeground: true   
        }
    });

    decorateGroup({
        objects: [
            "beach_ball",
            "beach_umbrella"
        ],
        qualifier: IsGround,
        fill: 1 / 32,
        stamp: {
            collisionType: matchNameToCollision,
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
    const decorator = new Decorator(layerBridge);

    MakeIslands.call(this,layerBridge);

    DecorateAll(...decorator.getParameterSet());

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
            } else if(type === UMBRELLA_COLLISION) {
                world.say("It's a beach umbrella.");
            }
        }
    }
    this.map.fxBackground = GetWaterBackground(80,112);
}

export default WaterPlace;

