const defaultSettings = {
    minWidth: 3,
    minHeight: 3,
    maxWidth: 5,
    maxHeight: 4,
    fill: 0.9
};

function applyDefaults(settings,defaultSettings) {
    Object.entries(defaultSettings).forEach(([key,value]) => {
        if(settings[key] === undefined) {
            settings[key] = value;
        }
    });
}

function GetIslandSettings(settings=defaultSettings) {
    applyDefaults(settings,defaultSettings);
    return settings;
}

const tileTypes = {
    nothing: 0,
    island: 1,
    pathway: 2
}

function IslandMaker(width,height,settings) {
    if(!settings) {
        settings = GetIslandSettings();
    }
    settings.minWidth = Math.max(settings.minWidth,3);
    settings.minHeight = Math.max(settings.minHeight,3);

    const grid = new Array(width);
    for(let x = 0;x<width;x++) {
        grid[x] = new Array(height);
    }

    const clearGrid = () => {
        for(let x = 0;x<width;x++) {
            grid[x].fill(tileTypes.nothing);
        }
    }

    const randomMinMax = (min,max) => {
        const difference = max - min + 1;
        return Math.floor(Math.random() * difference) + min;
    }

    const getIslands = () => {
        let fillTiles = Math.ceil(width * height * settings.fill);

        const islands = [];

        while(fillTiles >= 1) {
            const width = randomMinMax(
                settings.minWidth,
                settings.maxWidth
            );
            const height = randomMinMax(
                settings.minHeight,
                settings.maxHeight
            );
            const tiles = width * height;

            islands.push({
                width: width,
                height: height
            });

            fillTiles -= tiles;
        }

        return islands;
    }

    const placeIslands = (islands,x,y,xRange,yRange) => {
        for(let i = 0;i<islands.length;i++) {
            const island = islands[i];
            const islandWidth = island.width;
            const islandHeight = island.height;

            const islandX = randomMinMax(
                x,Math.max(xRange-islandWidth,x)
            );
            const islandY = randomMinMax(
                y,Math.max(yRange-islandHeight,y)
            );
            for(let x = 0;x<islandWidth;x++) {
                const column = grid[x+islandX];
                for(let y = 0;y<islandHeight;y++) {
                    column[y+islandY] = tileTypes.island;
                }
            }
        }
    }

    const makePaths = islands => {
        
    }

    const makeIslands = () => {
        const islands = getIslands();
        placeIslands(islands,0,0,width,height);
        //placeIslands(islands,0,1,0,height);
        makePaths(islands);
    }

    this.generateGrid = () => {
        clearGrid();
        makeIslands();
    }

    this.paint = (
        islandGridName,layerBridge,x,y,toBackground,toForeground
    ) => {
        layerBridge.stamp({
            name: islandGridName,
            x: x,
            y: y,
            toBackground: toBackground,
            toForeground: toForeground,
            width: width,
            height: height,
            parameters: [grid]
        })
    }
}
IslandMaker.getSettings = GetIslandSettings;

export default IslandMaker;
