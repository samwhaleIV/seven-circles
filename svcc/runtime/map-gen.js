import CordHelper from "./cord-helper.js";

function getEmptyLayer(size) {
    const layer = new Array(size);
    layer.fill(0);
    return layer;
}

function getMap(width,height,withLighting) {
    const upperXBound = width - 1;
    const upperYBound = height - 1;
    const tileCount = width * height;
    const map = {
        rows: height,
        columns: width,

        finalColumn: upperXBound,
        finalRow: upperYBound,

        upperVerticalBound: upperYBound,
        upperHorizontalBound: upperXBound,

        lowerHorizontalBound: 0,
        lowerVerticalBound: 0,

        /* Doesn't need to be declared, but for sake of debugging
           and future-proofism we let them have default values    */
        renderScale: null,
        requiredSongs: [],
    
        baseData: {
            background: getEmptyLayer(tileCount),
            foreground: getEmptyLayer(tileCount),
            collision:  getEmptyLayer(tileCount)
        }
    };
    if(withLighting) {
        map.baseData.lighting = getEmptyLayer(tileCount);
    }
    return map;
}

function defaultWorldLoad(startPosition,world) {
    if(!startPosition) {
        startPosition = {x:0,y:0};
    }
    if(!startPosition.d) {
        startPosition.d = "down";
    }
    world.addPlayer(
        startPosition.x,
        startPosition.y,
        startPosition.d
    );
    if(startPosition.xOffset) {
        world.playerObject.xOffset = startPosition.xOffset;
    }
    if(startPosition.yOffset) {
        world.playerObject.yOffset = startPosition.yOffset;
    }
}

function getDefaultWorldState(generatorData) {
    return function() {
        this.load = defaultWorldLoad.bind(null,generatorData.startPosition);
    }
}

function getRandomNoiseMap(width,height,start=1,length=4) {

    /* This is just a test function in case someday everything
       goes to hell and we need to restore some semblance of sanity */

    const map = getMap(width,height,false);
    const background = map.baseData.background;
    for(let i = 0;i<background.length;i++) {
        background[i] = start + Math.floor(Math.random() * length);
    }
    map.WorldState = getDefaultWorldState({
        startPosition: {
            x: Math.floor(width / 2),
            y: Math.floor(height / 2),
            xOffset: 0.5,
            yOffset: 0.5,
            d: "down"
        }
    })
    return map;
}

function procedurallyGenerate(
    width,height,generator,withLighting,...parameters
) {
    const map = getMap(width,height,withLighting);
    const generatorData = {
        map: map,
        width: width,
        height: height,
        withLighting: withLighting
    };
    generator.call(
        generatorData,
        new CordHelper(map),
        ...parameters
    );
    if(!map.WorldState) {
        map.WorldState = getDefaultWorldState(generatorData);
    }
    return map;
}

const MapGenFactory = {
    NoiseMap: getRandomNoiseMap,
    External: procedurallyGenerate
}

export default MapGenFactory;
