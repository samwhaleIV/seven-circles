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

    this.map.WorldState = function(world) {
        this.load = () => {
            world.addPlayer(2,2);
        }
    }
    this.map.fxBackground = GetWaterBackground(80,112);
}

export default WaterTest;

