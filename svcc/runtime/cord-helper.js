function applyGrid(
    grid,layer,dim1,dim2,dim1check,dim2check,dim1min,dim2min,dim1max,dim2max,getIdx,translateIdx
) {
    if(dim2 < dim2min || dim2 > dim2max) {
        return;
    }
    grid = grid.tiles;
    const gridSize = grid.length;

    const dim1Start = Math.max(dim1min,dim1);
    const gridOffset = dim1min - dim1;
    const dim1End = Math.min(dim1max + 1,dim1 + gridSize);

    const startIndex = getIdx(dim1check,dim2check);
    for(let index = dim1Start;index<dim1End;index++) {
        const gridIndex = index + gridOffset;
        const layerIndex = translateIdx(startIndex,index);
        layer[layerIndex] = grid[gridIndex];
    }
}

function applyGrid2D(
    x,y,grid,width,height,layer,bounds,getIdx
) {
    const xStart = Math.max(bounds.left,x);
    const yStart = Math.max(bounds.top,y);

    const xEnd = Math.min(bounds.right,x+width);
    const yEnd = Math.min(bounds.bottom,y+height);

    const gridXOffset = bounds.left - x;
    const gridYOffset = bounds.top - y;

    for(let xIndex = xStart;xIndex<xEnd;xIndex++) {
    for(let yIndex = yStart;yIndex<yEnd;yIndex++) {
        const layerIndex = getIdx(xIndex,yIndex);

        const gridXIndex = xIndex + gridXOffset;
        const gridYIndex = yIndex + gridYOffset;

        layer[layerIndex] = grid[gridXIndex][gridYIndex];
    }}
}

function LayerHelper(layer,getIdx,getXY,bounds) {
    this.set = (x,y,value) => {
        layer[getIdx(x,y)] = value;
    }
    this.get = (x,y) => {
        return layer[getIdx(x,y)];
    }
    this.remap = filter => {
        for(let i = 0;i<layer.length;i++) {
            const value = layer[i];
            const position = getXY(i);
            layer[i] = filter(position.x,position.y,value);
        }
    }
    this.applyHorizontalGrid = (x,y,grid) => applyGrid(
        grid,layer,x,y,0,y,
        bounds.left,bounds.top,bounds.right,bounds.bottom,
        getIdx,(start,idx) => start+idx
    );
    this.applyVerticalGrid = (x,y,grid) => applyGrid(
        grid,layer,y,x,x,0,
        bounds.top,bounds.left,bounds.bottom,bounds.right,
        getIdx,(start,idx) => start + idx * bounds.width
    );
    this.applyGrid = (x,y,grid) => {
        return applyGrid2D(
            x,y,grid.tiles,grid.width,grid.height,
            layer,bounds,getIdx
        );
    }
}

function CordHelper(map) {
    const baseData = map.baseData;

    const bounds = {
        width:  map.columns,
        height: map.rows,

        top:  map.lowerVerticalBound,
        left: map.lowerHorizontalBound,

        right:  map.upperHorizontalBound,
        bottom: map.upperVerticalBound,
    };

    const getIdx = (x,y) => x + y * map.columns;
    const getXY = idx => {
        const y = Math.floor(idx / map.columns);
        const x = idx - y * map.columns;
        return {x:x,y:y};
    }
    const layerParameters = [getIdx,getXY,bounds];
    this.background = new LayerHelper(
        baseData.background,...layerParameters
    );
    this.foreground = new LayerHelper(
        baseData.foreground,...layerParameters
    );
    this.collision = new LayerHelper(
        baseData.collision,...layerParameters
    );
    const layers = [
        this.background,this.foreground,this.collision
    ];
    if(baseData.lighting) {
        this.lighting = new LayerHelper(
            baseData.lighting,getIdx
        );
        layers.push(this.lighting);
    }

    const getLayerValues = (x,y) => {
        const values = new Array(layers.length);
        for(let i = 0;i<values.length;i++) {
            values[i] = layers[i].get(x,y);
        }
        return values;
    }
    const setLayerValues = (x,y,values) => {
        for(let i = 0;i<layers.length;i++) {
            layers[i].set(x,y,values[i]);
        }
    }

    this.get = (x,y) => getLayerValues(x,y);
    this.set = (x,y,values) => setLayerValues(x,y,values);

    this.remap = filter => {
        const length = baseData.background.length;
        for(let i = 0;i<length;i++) {
            const position = getXY(i);
            const values = getLayerValues(
                position.x,position.y
            );
            filter.call(
                null,values,position.x,position.y
            );
            setLayerValues(position.x,position.y,values);
        }
    }
}
export default CordHelper;
