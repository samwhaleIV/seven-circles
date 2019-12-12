import { PASS_THROUGH } from "./cord-helper.js";

const DISCRETE_TYPE = Symbol("discrete");
const DYNAMIC_TYPE = Symbol("dynamic");

const NO_VALUE = Symbol("noValue");

const ONE_DIMENSIONAL_TYPE = Symbol("oneDimensional");
const TWO_DIMENSIONAL_TYPE = Symbol("twoDimensional");

const NINE_GRID_SIZE_ERROR = "A 3x3 grid cannot be smaller than 3x3 (must be width >= 3 && height >= 3)";
const THREE_GRID_SIZE_ERROR = "A 3 grid cannot be smaller in length than 3 (size must be >= 3)";

const GRID_DIMENSION_MISMATCH = "Grid dimensions do not match, cannot combine grids";
const INVALID_GRID_GROUP = "A grid group cannot be made without valid arguments";

const EMPTY_GRID = {
    type: TWO_DIMENSIONAL_TYPE,
    width: 0,
    height: 0,
    size: 0,
    tiles: [[]]
};

function TileBridge(objects) {
    this.objectTypes = {
        discrete: DISCRETE_TYPE,
        dynamic: DYNAMIC_TYPE
    };
    this.dynamicTypes = {
        oneDimensional: ONE_DIMENSIONAL_TYPE,
        twoDimensional: TWO_DIMENSIONAL_TYPE
    };

    this.get = name => objects[name];

    const getObject = (width,height,fill,xOffset=0,yOffset=0) => {
        if(typeof fill !== "function") {
            const fillValue = fill;
            fill = () => fillValue;
        }
        const tiles = new Array(width);
        for(let x = 0;x<width;x++) {
            const column = new Array(height);
            for(let y = 0;y<height;y++) {
                column[y] = fill.call(null,x+xOffset,y+yOffset);
            }
            tiles[x] = column;
        }
        const size = width * height;
        return {
            width: width,
            height: height,
            size: size,
            tiles: tiles,
            type: DISCRETE_TYPE,
            offset: this.getObject.bind(null,width,height,fill)
        }
    }
    this.getObject = getObject;

    this.getPattern = function(width,height) {
        return getObject(width,height,this.fill);
    }

    this.addObject = (name,index,width,height) => {
        objects[name] = this.getObject(
            width,height,
            (x,y) =>
            index + x + y * WorldTextureColumns
        );
    }

    this.addSmallObject = (name,index) => this.addObject(name,index,1,1);
    this.add2x2Object = (name,index) => this.addObject(name,index,2,2);

    this.addDynamicObject = (name,getGrid,data) => {
        objects[name] = {
            type: DYNAMIC_TYPE,
            getGrid: getGrid.bind(data)
        }
    }
    this.get3Grid = function(size) {
        if(size < 3) {
            throw Error(THREE_GRID_SIZE_ERROR);
        }
        const grid = new Array(size);
        grid[0] = this.start;
        const end = size - 1;
        for(let i = 1;i<end;i++) {
            grid[i] = this.middle;
        }
        grid[size-1] = this.end;
        return {
            type: ONE_DIMENSIONAL_TYPE,
            size: size,
            tiles: grid
        }
    }

    this.get9GridMeta = index => {
        const row1Start = index;
        const row2Start = index + WorldTextureColumns;
        const row3Start = index + WorldTextureColumns * 2;

        return {
            top:      row1Start + 1,
            topLeft:  row1Start,
            topRight: row1Start + 2,

            middle: row2Start + 1,
            left:   row2Start,
            right:  row2Start + 2,

            bottom:      row3Start + 1,
            bottomLeft:  row3Start,
            bottomRight: row3Start + 2

        }
    }

    this.getGridGroup = grids => {
        let firstGrid, gridType;
        for(let i = 0;i<grids.length;i++) {
            let grid = grids[i];
            if(Array.isArray(grid)) {
                grid = {
                    size: grid.length,
                    type: ONE_DIMENSIONAL_TYPE,
                    tiles: grid
                };
                grids[i] = grid;
            }
            if(grid) {
                firstGrid = grid;
                if(firstGrid.type) {
                    gridType = firstGrid.type;
                } else {
                    gridType = ONE_DIMENSIONAL_TYPE;
                }
                break;
            }
        }
        const gridCount = grids.length;
        if(gridCount < 2) {
            if(firstGrid) {
                return firstGrid;
            } else {
                return EMPTY_GRID;
            }
        }
        if(!firstGrid || ! gridType) {
            throw Error(INVALID_GRID_GROUP);
        }
        const suggestedFilter = new Array(gridCount).fill(null);
        for(let i = 0;i<grids.length;i++) {
            let grid = grids[i];
            if(grid) {
                if(gridType === ONE_DIMENSIONAL_TYPE) {
                    if(Array.isArray(grid)) {
                        grid = {
                            size: grid.length,
                            type: ONE_DIMENSIONAL_TYPE,
                            tiles: grid
                        };
                        grids[i] = grid;
                    }
                    if(grid.type !== ONE_DIMENSIONAL_TYPE) {
                        throw Error(GRID_DIMENSION_MISMATCH);
                    }
                }
                if(grid.size > 0) {
                    suggestedFilter[i] = PASS_THROUGH;
                }
            }
        }
        const newGrid = {
            type: gridType,
            size: firstGrid.size,
            filter: suggestedFilter
        };

        const fillRow = (row,routine) => {
            const size = row.length;
            for(let x = 0;x<size;x++) {
                const set = new Array(gridCount);
                for(let i = 0;i<gridCount;i++) {
                    const result = routine.call(null,grids[i],x);
                    if(result !== NO_VALUE) {
                        set[i] = result;
                    }
                }
                row[x] = set;
            }
        }
        if(gridType === ONE_DIMENSIONAL_TYPE) {
            const size = newGrid.size;
            const tiles = new Array(size);
            fillRow(tiles,(grid,i)=>{
                if(grid) {
                    return grid.tiles[i];
                } else {
                    return NO_VALUE;
                }
            });
            newGrid.tiles = tiles;
        } else {
            const width = firstGrid.width;
            const height = firstGrid.height;
            newGrid.width = width;
            newGrid.height = height;

            const tiles = new Array(width);
            for(let x = 0;x<width;x++) {
                const column = new Array(height);
                fillRow(column,(grid,y) => {
                    if(grid) {
                        return grid.tiles[x][y];
                    } else {
                        return NO_VALUE;
                    }
                });
                tiles[x] = column;
            }
            newGrid.tiles = tiles;
        }
        return newGrid;
    }

    this.parameterize = cords => {
        if(Array.isArray(cords)) {
            return cords;
        }
        const newCords = [cords.x,cords.y];
        if(cords.length) {
            newCords.push(cords.length);
        } else {
            if(cords.width) {
                newCords.push(cords.width);
            }
            if(cords.height) {
                newCords.push(cords.height);
            }
        }
        return newCords;
    }

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

    const islandType = 1;
    const pathType = 2;

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
        const l = !area9[left] ? true : false;
        const t = area9[top]? true : false;
        const b = area9[bottom]? true : false;
        const r = area9[right]? true : false;
        return l && t && b && r;
        //return !area9[left] && area9[top] && area9[bottom] && area9[right];
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

    const processIslandGridType = area9 => {
        if(area9[top] === pathType) {
            return top_path;
        } else if(area9[bottom] === pathType) {
            return bottom_path;
        } else if(area9[left] === pathType) {
            return left_path;
        } else if(area9[right] === pathType) {
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

    this.getIslandGrid = function(width,height,generationData) {
        const grid = new Array(width);

        for(let x = 0;x<width;x++) {
            grid[x] = new Array(height).fill(0);

            for(let y = 0;y<height;y++) {
        
                const area9 = getArea9(
                    generationData,x,y
                );
                const generationValue = area9[middle];

                let targetValue = null;
                switch(generationValue) {
                    default: case 0: break;
                    case islandType:
                        targetValue = this[
                            processIslandGridType(area9)
                        ];
                        break;
                    case pathType:
                        targetValue = this.path.get(
                            area9[left],area9[right],
                            area9[top],area9[bottom]
                        );
                        break;
                }
                if(targetValue !== null) {
                    grid[x][y] = targetValue;
                }
            }
        }

        for(let x = 0;x<width;x++) {
        for(let y = 0;y<height;y++) {
            const area9 = getArea9(
                grid,x,y
            );
            const generationValue = area9[middle];

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
        }}

        return {
            type: TWO_DIMENSIONAL_TYPE,
            width: width,
            height: height,
            size: width * height,
            tiles: grid
        };

    }
    this.getIslandGridMeta = function(
        nineGridIdx,nineGridCornerIdx,pathGridIdx
    ) {
        const metadata = this.get9GridMeta(nineGridIdx);

        const row4Start = nineGridCornerIdx;
        const row5Start = nineGridCornerIdx + WorldTextureColumns;

        metadata.inverseTopLeft = row4Start;
        metadata.inverseTopRight = row4Start + 1;
        metadata.inverseBottomLeft = row5Start;
        metadata.inverseBottomRight = row5Start + 1;

        const pathRow1 = pathGridIdx;
        const pathRow2 = pathGridIdx + WorldTextureColumns;
        const pathRow3 = pathGridIdx + WorldTextureColumns * 2;

       const edgeRow1 = nineGridCornerIdx + WorldTextureColumns * 2;
       const edgeRow2 = nineGridCornerIdx + WorldTextureColumns * 3;
       const edgeRow3 = nineGridCornerIdx + WorldTextureColumns * 4;
       const edgeRow4 = nineGridCornerIdx + WorldTextureColumns * 5;

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

        path[top_path] = pathRow1 + 3;
        path[bottom_path] = pathRow1 + 2;
        path[left_path] = pathRow2 + 3;
        path[right_path] = pathRow3;


        const getHash = (left,right,top,bottom) => {
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

        path.get = (left,right,top,bottom) => {
            const hash = getHash(left,right,top,bottom);
            return path[hash];
        }
        metadata.path = path;

        return metadata;
    }

    this.get9Grid = function(width,height) {
        if(width < 3 || height < 3) {
            throw Error(NINE_GRID_SIZE_ERROR);
        }

        const bottom = height - 1;
        const right = width - 1;

        const tiles = new Array(width);
        for(let x = 0;x<width;x++) {
            const column = new Array(height);
            let fillType;
            if(x === 0) {
                fillType = this.left;
            } else if(x === right) {
                fillType = this.right;
            } else {
                fillType = this.middle;
            }
            column[0] = this.top;
            for(let y = 1;y<bottom;y++) {
                column[y] = fillType;
            }
            column[bottom] = this.bottom;
            tiles[x] = column;
        }

        const firstColumn = tiles[0];
        const lastColumn =  tiles[right];

        firstColumn[0] = this.topLeft;
        lastColumn[0] =  this.topRight;

        firstColumn[bottom] = this.bottomLeft;
        lastColumn[bottom] =  this.bottomRight;

        return {
            type: TWO_DIMENSIONAL_TYPE,
            width: width,
            height: height,
            size: width * height,
            tiles: tiles
        };
    }
}

export default TileBridge;
