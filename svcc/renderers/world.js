import WorldRenderer from "../../../elven-engine/renderers/world.js";

function SVCCWorldRenderer(...parameters) {
    WorldRenderer.apply(this,parameters);
    this.setTilesetImage("world-tileset");
    
    this.loadLastMapOrDefault = () => {
        this.updateMap("test-map");
        return null;
    }
}
export default SVCCWorldRenderer;
