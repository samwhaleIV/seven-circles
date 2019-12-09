import TileBridge from "../tile-bridge.js";
import LayerBridge from "../layer-bridge.js";
import GetWaterBackground from "../../../../elven-engine/renderers/components/world/water-background.js";

const objects = {};
const bridge = new TileBridge(objects);


function WaterTest(layers) {

    const layerBridge = new LayerBridge(layers,bridge);

    this.map.backgroundColor = "black";

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
    this.map.fxBackground = GetWaterBackground(80,112);
}

export default WaterTest;

