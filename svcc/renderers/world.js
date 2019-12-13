import WorldRenderer from "../../../elven-engine/renderers/world.js";

function SVCCWorldRenderer(...parameters) {
    WorldRenderer.apply(this,parameters);
    this.setTilesetImage("world-tileset");

    this.escapeMenuDisabled = true;
    this.forcedRenderScale = 1;

    this.loadLastMapOrDefault = () => {
        this.updateMap(ENV_FLAGS.DEBUG_MAP);
        return null;
    }

    this.mapChanged = () => {
        this.playerObject.renderYOffset = 0.1;
        //add the ui layer when the map updates
        this.addCustomRenderer({render:function(){
            drawTextBlack(`cam. resolve x: ${rendererState.cameraResolveX}`,5,5,4);
            drawTextBlack(`cam. resolve y: ${rendererState.cameraResolveY}`,5,30,4);
            //drawTextWhite("yeet",50,50,LargeTextScale);
        }});
    }

    //open ui and lock player movement and unlock player movement to use...
    this.processMove = function(x,y) {

    }
    this.processClick = function(x,y) {

    }
    this.processClickEnd = function(x,y) {

    }
}
export default SVCCWorldRenderer;
