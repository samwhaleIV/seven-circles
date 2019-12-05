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
    type: ONE_DIMENSIONAL_TYPE,
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

    this.getObject = (width,height,fill,xOffset=0,yOffset=0) => {
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
        if(cords.length !== undefined) {
            return [cords.x,cords.y,cords.length];
        } else {
            return [cords.x,cords.y,cords.width,cords.height];
        }
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
