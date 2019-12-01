function getEmptyLayer(size) {
    const layer = new Array(size);
    layer.fill(0);
    return layer;
}

function getMap(width,height,renderScale=2) {
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
        renderScale: renderScale,
        requiredSongs: [],
        baseData: {
            background: getEmptyLayer(tileCount),
            foreground: getEmptyLayer(tileCount),
            collision: getEmptyLayer(tileCount)
        }
    };
    return map;
}

function getRandomMap(width,height) {
    const map = getMap(width,height);
    const background = map.baseData.background;
    for(let i = 0;i<background.length;i++) {
        background[i] = 1 + Math.floor(Math.random() * 4);
    }
    map.WorldState = function() {
        this.load = world => {
            world.addPlayer(49,49,"down");
        }
    }
    return map;
}
const worldMaps = {};

function addMap(name,map) {
    map.name = name;
    worldMaps[name] = map;
}
addMap("test-map",getRandomMap(100,100));
