"use strict";

const defaultSettings = {
    minWidth: 3,
    minHeight: 3,
    maxWidth: 5,
    maxHeight: 4,
    fill: 0.9,
    pathFill: 1
};

const tileTypes = {
    nothing: 0,
    island: 1,
    pathway: 2
};

function applyDefaults(settings,defaultSettings) {
    Object.entries(defaultSettings).forEach(([key,value]) => {
        if(settings[key] === undefined) {
            settings[key] = value;
        }
    });
}

const middle = 4;
const left = 3;
const right = 5;
const top = 1;
const bottom = 7;

const topLeft = 0;
const topRight = 2;
const bottomLeft = 6;
const bottomRight = 8;

const top_path = 101;
const bottom_path = 102;
const left_path = 103;
const right_path = 104;

const getArea9 = (array2D,x,y) => {

    const column1 = array2D[x-1];
    const column3 = array2D[x+1];
    const column2 = array2D[x];

    const height = column2.length;

    const row1 = y > 0 ? 1 : 0;
    const row3 = y <= height ? 1 : 0;

    return [
        column1 ? row1 ? column1[y-1] : 0 : 0,
        row1 ? column2[y-1] : 0,
        column3 ? row1 ? column3[y-1] : 0 : 0,

        column1 ? column1[y] : 0,
        column2[y],
        column3 ? column3[y] : 0,

        column1 ? row3 ? column1[y+1] : 0 : 0,
        row3 ? column2[y+1] : 0,
        column3 ? row3 ? column3[y+1] : 0 : 0
    ];
}

const isTopLeftCorner = area9 => {
    return !area9[left] && !area9[top] && area9[bottom] && area9[right];
}
const isTopRightCorner = area9 => {
    return area9[left] && !area9[top] && area9[bottom] && !area9[right];
}
const isBottomLeftCorner = area9 => {
    return !area9[left] && area9[top] && !area9[bottom] && area9[right];
}
const isBottomRightCorner = area9 => {
    return area9[left] && area9[top] && !area9[bottom] && !area9[right];
}

const getCornerType = area9 => {
    if(isTopLeftCorner(area9)) {
        return "topLeft";
    } else if(isTopRightCorner(area9)) {
        return "topRight";
    } else if(isBottomLeftCorner(area9)) {
        return "bottomLeft";
    } else if(isBottomRightCorner(area9)) {
        return "bottomRight";
    } else {
        return null;
    }
}

const isInverseTopLeft = area9 => {
    return area9[left] && area9[top] && !area9[topLeft];
}
const isInverseTopRight = area9 => {
    return area9[right] && area9[top] && !area9[topRight];
}
const isInverseBottomLeft = area9 => {
    return area9[left] && area9[bottom] && !area9[bottomLeft];
}
const isInverseBottomRight = area9 => {
    return area9[right] && area9[bottom] && !area9[bottomRight];
}

const getInverseCornerType = area9 => {
    if(isInverseTopLeft(area9)) {
        return "inverseTopLeft";
    } else if(isInverseTopRight(area9)) {
        return "inverseTopRight";
    } else if(isInverseBottomLeft(area9)) {
        return "inverseBottomLeft";
    } else if(isInverseBottomRight(area9)) {
        return "inverseBottomRight";
    } else {
        return null;
    }
}

const isLeftSide = area9 => {
    return !area9[left] && area9[top] && area9[bottom] && area9[right];
}
const isRightSide = area9 => {
    return area9[left] && area9[top] && area9[bottom] && !area9[right];
}
const isTopSide = area9 => {
    return area9[left] && !area9[top] && area9[bottom] && area9[right];
}
const isBottomSide = area9 => {
    return area9[left] && area9[top] && !area9[bottom] && area9[right];
}

const getSideType = area9 => {
    if(isLeftSide(area9)) {
        return "left";
    } else if(isRightSide(area9)) {
        return "right";
    } else if(isTopSide(area9)) {
        return "top";
    } else if(isBottomSide(area9)) {
        return "bottom";
    } else {
        return null;
    }
}

function tryResolveDoubleEdges(
    area9,generationValue,grid,x,y
) {
    if(generationValue === this.top) {
        if(area9[right] === this.bottom) {
            grid[x][y] = this.edgeTopBottom;
            grid[x+1][y] = this.edgeTopBottom + 1;
        }
    } else if(generationValue === this.bottom) {
        if(area9[right] === this.top) {
            grid[x][y] = this.edgeBottomTop;
            grid[x+1][y] = this.edgeBottomTop + 1;
        }
    } else if(generationValue === this.right) {
        if(area9[bottom] === this.left) {
            grid[x][y] = this.edgeRightLeft
            grid[x][y+1] = this.edgeRightLeft + 1;
        }
    } else if(generationValue === this.left) {
        if(area9[bottom] === this.right) {
            grid[x][y] = this.edgeLeftRight;
            grid[x][y+1] = this.edgeLeftRight + 1;
        }
    }
}

const processIslandGridType = area9 => {
    if(area9[top] === tileTypes.pathway) {
        return top_path;
    } else if(area9[bottom] === tileTypes.pathway) {
        return bottom_path;
    } else if(area9[left] === tileTypes.pathway) {
        return left_path;
    } else if(area9[right] === tileTypes.pathway) {
        return right_path;
    }

    const sideType = getSideType(area9);
    if(sideType !== null) {
        return sideType;
    }

    const inverseCornerType = getInverseCornerType(area9);
    if(inverseCornerType !== null) {
        return inverseCornerType;
    }

    const cornerType = getCornerType(area9);
    if(cornerType !== null) {
        return cornerType;
    }

    return "middle";
}
const getLRTBHash = (left,right,top,bottom) => {
    let string = "";
    if(left) string += "Left";
    if(right) string += "Right";
    if(top) string += "Top";
    if(bottom) string += "Bottom";
    if(!string) {
        return "LeftRightTopBottom";
    }
    return string;
}

const processGenerationValue = (target,generationValue,area9) => {
    switch(generationValue) {
        default:
            return null;
        case tileTypes.island:
            return target[
                processIslandGridType(area9)
            ];
        case tileTypes.pathway:
            return target.path.get(
                area9[left],area9[right],
                area9[top],area9[bottom]
            );
    }
}

const randomMinMax = (min,max) => {
    const difference = max - min + 1;
    return Math.floor(Math.random() * difference) + min;
}

const getIslands = (settings,islandWidth,islandHeight) => {
    let fillTiles = Math.ceil(islandWidth * islandHeight * settings.fill);

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

const placeIslands = (grid,islands,x,y,xRange,yRange) => {
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

const isVerticalPathStart = area9 => {
    return area9[middle] === tileTypes.island &&
    area9[left] === tileTypes.island &&
    area9[right] === tileTypes.island &&
    !area9[bottomLeft] &&
    !area9[bottomRight] &&
    !area9[bottom];
}
const isVerticalPathEnd = area9 => {
    return area9[bottom] === tileTypes.island &&
    area9[bottomLeft] === tileTypes.island &&
    area9[bottomRight] === tileTypes.island;
}

const isHorizontalPathStart = area9 => {
    return area9[middle] === tileTypes.island &&
    area9[top] === tileTypes.island &&
    area9[bottom] === tileTypes.island &&
    !area9[right] &&
    !area9[topRight] &&
    !area9[bottomRight];
}
const isHorizontalPathEnd = area9 => {
    return area9[right] === tileTypes.island &&
    area9[topRight] === tileTypes.island &&
    area9[bottomRight] === tileTypes.island;
}

const isEmptyRow = area9 => {
    return area9[middle] === tileTypes.nothing &&
    area9[left] === tileTypes.nothing &&
    area9[right] === tileTypes.nothing;
}
const isEmptyColumn = area9 => {
    return area9[middle] === tileTypes.nothing &&
    area9[top] === tileTypes.nothing &&
    area9[bottom] === tileTypes.nothing;
}

const getPathsIterate = (x,y,info) => {
    const area9 = getArea9(info.grid,x,y);
    if(info.pathing) {
        if(info.isSegment(area9)) {
            info.pathBuffer.push({
                x: x,
                y: y
            });
            if(info.isEnd(area9)) {
                info.pathing = false;
                info.paths.push(info.pathBuffer.splice(0));
            }
        } else {
            info.pathBuffer.splice(0);
            info.pathing = false;
        }
    } else {
        if(info.isStart(area9)) {
            info.pathing = true;
        }
    }
}
const getPathIterateInfo = () => {
    return {
        paths: [],
        pathBuffer: [],
        pathing: false
    };
}
const getVerticalPaths = (grid,islandWidth,islandHeight) => {
    const info = getPathIterateInfo();
    info.grid = grid;
    info.isStart = isVerticalPathStart;
    info.isEnd = isVerticalPathEnd;
    info.isSegment = isEmptyRow;
    for(let x = 0;x<islandWidth;x+=2) {
        for(let y = 0;y<islandHeight;y++) {
            getPathsIterate(x,y,info);
        }
        info.pathing = false;
        info.pathBuffer.splice(0);
    }
    return info.paths;
}
const getHorizontalPaths = (grid,islandWidth,islandHeight) => {
    const info = getPathIterateInfo();
    info.grid = grid;
    info.isStart = isHorizontalPathStart;
    info.isEnd = isHorizontalPathEnd;
    info.isSegment=  isEmptyColumn;
    for(let y = 0;y<islandHeight;y+=2) {
        for(let x = 0;x<islandWidth;x++) {
            getPathsIterate(x,y,info);
        }
        info.pathing = false;
        info.pathBuffer.splice(0);
    }
    return info.paths;
}

const getPaths = (grid,islandWidth,islandHeight) => {
    const horizontalPaths = getHorizontalPaths(
        grid,islandWidth,islandHeight
    );
    const verticalPaths = getVerticalPaths(
        grid,islandWidth,islandHeight
    );
    const allPaths = horizontalPaths.concat(verticalPaths);
    return allPaths;
}

const makePaths = (
    grid,settings,islandWidth,islandHeight
) => {
    const paths = getPaths(grid,islandWidth,islandHeight);
    let pathCount = Math.round(settings.pathFill * paths.length);
    while(pathCount > 0) {
        const path = removeRandomEntry(paths);
        for(let i = 0;i<path.length;i++) {
            const pathPosition = path[i];
            grid[pathPosition.x][pathPosition.y] = tileTypes.pathway;
        }
        pathCount--;
    }
}

const makeIslands = (
    grid,settings,islandWidth,islandHeight
) => {
    const islands = getIslands(
        settings,islandWidth,islandHeight
    );
    placeIslands(
        grid,islands,0,0,
        islandWidth,islandHeight
    );
    makePaths(
        grid,settings,islandWidth,islandHeight
    );
}

function IslandMaker({layerBridge,width,height,settings}) {

    const islandWidth = width;
    const islandHeight = height;
    settings.minWidth = Math.max(settings.minWidth,3);
    settings.minHeight = Math.max(settings.minHeight,3);

    const updateSettings = newSettings => {
        applyDefaults(newSettings,defaultSettings);
        settings = newSettings;
    }
    if(!settings) {
        settings = {};
    }
    applyDefaults(settings,defaultSettings);

    const grid = new Array(islandWidth);
    for(let x = 0;x<islandWidth;x++) {
        grid[x] = new Array(islandHeight);
    }

    const clearGrid = () => {
        for(let x = 0;x<islandWidth;x++) {
            grid[x].fill(tileTypes.nothing);
        }
    }

    this.generateGrid = newSettings => {
        if(newSettings) {
            updateSettings(newSettings);
        }
        clearGrid();
        makeIslands(
            grid,settings,
            islandWidth,islandHeight
        );
        return this;
    }

    this.paint = ({
        name,x=0,y=0,width=islandWidth,height=islandHeight,
        toBackground,toForeground,toCollision,toLighting
    }) => {
        layerBridge.stamp({
            name: name,
            x: x,
            y: y,
            toBackground: toBackground,
            toForeground: toForeground,
            toCollision: toCollision,
            toLighting: toLighting,
            width: width,
            height: height,
            parameters: [grid]
        })
    }
    return this;
}
const doubleIterator = (method,width,height) => {
    for(let x = 0;x<width;x++) {
    for(let y = 0;y<height;y++) {
        method.call(null,x,y);
    }};
};
function getGrid(width,height,generationData) {
    const grid = new Array(width);

    for(let x = 0;x<width;x++) {
        grid[x] = new Array(height).fill(tileTypes.nothing);
    }

    doubleIterator((x,y)=>{
        const area9 = getArea9(
            generationData,x,y
        );
        const generationValue = area9[middle];

        const targetValue = processGenerationValue(
            this,generationValue,area9
        );

        if(targetValue !== null) {
            grid[x][y] = targetValue;
        }
    },width,height);

    doubleIterator((x,y)=>{
        const area9 = getArea9(
            grid,x,y
        );
        const generationValue = area9[middle];

        tryResolveDoubleEdges.call(
            this,area9,generationValue,grid,x,y
        );
    },width,height);

    const dataType = this.bridge.dynamicTypes.twoDimensional;
    return {
        type: dataType,
        width: width,
        height: height,
        size: width * height,
        tiles: grid
    };

}
function getGridMeta(
    nineGridIdx,nineGridCornerIdx,pathGridIdx
) {
    const metadata = this.get9GridMeta(nineGridIdx);

    const row4Start = nineGridCornerIdx;
    const row5Start = row4Start + WorldTextureColumns;

    metadata.inverseTopLeft = row4Start;
    metadata.inverseTopRight = row4Start + 1;
    metadata.inverseBottomLeft = row5Start;
    metadata.inverseBottomRight = row5Start + 1;

    const pathRow1 = pathGridIdx;
    const pathRow2 = pathRow1 + WorldTextureColumns;
    const pathRow3 = pathRow2 + WorldTextureColumns;

   const edgeRow1 = row5Start + WorldTextureColumns;
   const edgeRow2 = edgeRow1 + WorldTextureColumns;
   const edgeRow3 = edgeRow2 + WorldTextureColumns;
   const edgeRow4 = edgeRow3 + WorldTextureColumns;

    const path = {    
        /* Root count is 11 because:

            (16) minus (4 dead ends)
            minus (1 all closed) equals (11)
        */
        LeftRightBottom: pathRow1, //1101
        LeftRightTop: pathRow1 + 1, //1110

        RightTopBottom: pathRow2, //1011
        LeftTopBottom: pathRow2 + 1, //0111

        TopBottom: pathRow2 + 2, //0011
        LeftRight: pathRow3 + 1, //1100

        LeftRightTopBottom: pathRow3 + 2, //1111

        RightBottom: pathRow3 + 3, //0101
        LeftBottom: pathRow1 + 4, //1001
        LeftTop: pathRow2 + 4, //1010
        RightTop: pathRow3 + 4, //0110
    }
    
    metadata.edgeTopBottom = edgeRow1;
    metadata.edgeBottomTop = edgeRow2;

    metadata.edgeRightLeft = edgeRow3;
    metadata.edgeLeftRight = edgeRow4;

    metadata[top_path] = pathRow1 + 3;
    metadata[bottom_path] = pathRow1 + 2;
    metadata[left_path] = pathRow2 + 3;
    metadata[right_path] = pathRow3;

    path.get = (left,right,top,bottom) => path[
        getLRTBHash(left,right,top,bottom)
    ];
    
    metadata.path = path;

    return metadata;
}
IslandMaker.getGridMeta=  function(tileBridge,...parameters) {
    getGridMeta.apply(tileBridge,parameters);
}
IslandMaker.getGrid = getGrid;
IslandMaker.import = function() {
    return [{
        name: "getIslandGridMeta",
        method: getGridMeta
    },{
        name: "getIslandGrid",
        method: getGrid
    }];
}
IslandMaker.create = function({
    layerBridge,width,height,settings,
    name,x=0,y=0,
    toBackground,toForeground,toCollision,toLighting,
}) {
    const islandMaker = new IslandMaker({
        layerBridge: layerBridge,
        width: width,
        height: height,
        settings: settings
    });
    islandMaker.generateGrid();
    islandMaker.paint({
        name: name,
        x: x,
        y: y,
        toBackground: toBackground,
        toForeground: toForeground,
        toCollision: toCollision,
        toLighting: toLighting
    });
}

export default IslandMaker;
