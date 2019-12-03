const DISCRETE_TYPE = Symbol("discrete");
const DYNAMIC_TYPE = Symbol("dynamic");

const ONE_DIMENSIONAL_TYPE = Symbol("oneDimensional");
const TWO_DIMENSIONAL_TYPE = Symbol("twoDimensional");

const NINE_GRID_SIZE_ERROR = "A 3x3 grid cannot be smaller than 3x3 (must be width >= 3 && height >= 3)";
const THREE_GRID_SIZE_ERROR = "A 3 grid cannot be smaller in length than 3 (size must be >= 3)";

function TileBridge(objects) {
    this.objectTypes = {
        discrete: DISCRETE_TYPE,
        dynamic: DYNAMIC_TYPE
    };
    this.dynamicTypes = {
        oneDimensional: ONE_DIMENSIONAL_TYPE,
        twoDimensional: TWO_DIMENSIONAL_TYPE
    };
    this.addObject = (name,index,width,height) => {
        const tiles = new Array(width);
        for(let x = 0;x<width;x++) {
            const column = new Array(height);
            const xIndex = index + x;
            for(let y = 0;y<height;y++) {
                column[y] = xIndex + y * WorldTextureColumns;
            }
            tiles[x] = column;
        }
        objects[name] = {
            width: width,
            height: height,
            tiles: tiles,
            type: DISCRETE_TYPE
        }
    }

    this.addSmallObject = (name,index) => this.addObject(name,index,1,1);
    this.add4x4Object = (name,index) => this.addObject(name,index,4,4);

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

    this.get3x3Grid = function(width,height) {
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
