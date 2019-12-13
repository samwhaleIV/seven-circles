function applyGrid(
    grid,dim1,dim2,dim1check,dim2check,dim1min,dim2min,dim1max,dim2max,getIdx,translateIdx,setIdx
) {
    if(dim2 < dim2min || dim2 > dim2max + 1) {
        return;
    }

    const gridSize = grid.length;

    const dim1Start = Math.max(dim1min,dim1);
    const gridOffset = dim1min - dim1;
    const dim1End = Math.min(dim1max + 1,dim1 + gridSize);

    const startIndex = getIdx(dim1check,dim2check);
    for(let index = dim1Start;index<dim1End;index++) {
        const gridIndex = index + gridOffset;
        const layerIndex = translateIdx(startIndex,index);

        const gridValue = grid[gridIndex];
        setIdx(layerIndex,gridValue);
    }
}

function applyGrid2D(
    x,y,grid,width,height,bounds,getIdx,setIdx
) {
    const xStart = Math.max(bounds.left,x);
    const yStart = Math.max(bounds.top,y);

    const maxX = bounds.right + 1;
    const maxY = bounds.bottom + 1;

    const xEnd = Math.min(maxX,x+width);
    const yEnd = Math.min(maxY,y+height);

    const gridXOffset = bounds.left - x;
    const gridYOffset = bounds.top - y;

    for(let xIndex = xStart;xIndex<xEnd;xIndex++) {
    for(let yIndex = yStart;yIndex<yEnd;yIndex++) {
        const layerIndex = getIdx(xIndex,yIndex);

        const gridXIndex = xIndex + gridXOffset;
        const gridYIndex = yIndex + gridYOffset;

        const gridValue = grid[gridXIndex][gridYIndex];
        setIdx(layerIndex,gridValue);
    }}
}

const PASS_THROUGH = function() {
    return this.newValue;
}

const gridApplicationFilters = {
    None: [0,0,0,0],
    All:  [1,1,1,1],

    Background: [1,0,0,0],
    Foreground: [0,1,0,0],
    Collision:  [0,0,1,0],
    Lighting:   [0,0,0,1],

    BackgroundForeground: [1,1,0,0],
    BackgroundCollision:  [1,0,1,0],
    BackgroundLighting:   [1,0,0,1],

    BackgroundForegroundCollision: [1,1,1,0],
    BackgroundForegroundLighting:  [1,1,0,1],
    BackgroundCollisionLighting:   [1,0,1,1],

    CollisionLighting: [0,0,1,1],

    ForegroundCollision: [0,1,1,0],
    ForegroundLighting:  [0,1,0,1],
    ForegroundCollisionLighting: [0,1,1,1],

}
Object.values(gridApplicationFilters).forEach(filterSet => {
    filterSet.forEach((value,index) => {
        if(value) {
            filterSet[index] = PASS_THROUGH;
        } else {
            filterSet[index] = null;
        }
    });
});

function LayerHelper(layer,getIdx,getXY,bounds) {
    const setFast = (index,value) => layer[index] = value;
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
        grid.tiles,x,y,0,y,
        bounds.left,bounds.top,bounds.right,bounds.bottom,
        getIdx,(start,idx) => start + idx,setFast
    );
    this.applyVerticalGrid = (x,y,grid) => applyGrid(
        grid.tiles,y,x,x,0,
        bounds.top,bounds.left,bounds.bottom,bounds.right,
        getIdx,(start,idx) => start + idx * bounds.width,setFast
    );
    this.applyGrid = (x,y,grid) => {
        return applyGrid2D(
            x,y,grid.tiles,grid.width,grid.height,
            bounds,getIdx,setFast
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
    const dataLayers = [
        baseData.background,
        baseData.foreground,
        baseData.collision
    ];
    if(baseData.lighting) {
        this.lighting = new LayerHelper(
            baseData.lighting,getIdx
        );
        layers.push(this.lighting);
        dataLayers.push(baseData.lighting);
    }

    const layerCount = layers.length;

    this.getLayer = ID => layers[ID];

    const getLayerValues = (x,y) => {
        const values = new Array(layerCount);
        for(let i = 0;i<values.length;i++) {
            values[i] = layers[i].get(x,y);
        }
        return values;
    }
    const setLayerValues = (x,y,values) => {
        const end = Math.min(values.length,layerCount);
        for(let i = 0;i<end;i++) {
            layers[i].set(x,y,values[i]);
        }
    }
    const setLayerValuesFast = (index,values) => {
        const end = Math.min(values.length,layerCount);
        for(let i = 0;i<end;i++) {
            dataLayers[i][index] = values[i];
        }
    }
    const setLayerValuesFiltered = (filters,index,values) => {
        const end = Math.min(values.length,layerCount,filters.length);
        for(let i = 0;i<end;i++) {
            const filter = filters[i];
            if(filter) {
                const layer = dataLayers[i];
                const position = getXY(index);
                layer[index] = filter.call({
                    layerID: i,
                    layer: layers[i],
                    index: index,
                    x: position.x,
                    y: position.y,
                    newValue: values[i],
                    oldValue: layer[index]
                });
            }
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
            filter.call(null,{
                values: values,
                x: position.x,
                y: position.y
            });
            setLayerValues(position.x,position.y,values);
        }
    }

    this.applyHorizontalGrid = (x,y,grid,filters) => applyGrid(
        grid.tiles,x,y,0,y,
        bounds.left,bounds.top,bounds.right,bounds.bottom,
        getIdx,(start,idx) => start+idx,
        filters ? setLayerValuesFiltered.bind(null,filters) : setLayerValuesFast
    );
    this.applyVerticalGrid = (x,y,grid,filters) => applyGrid(
        grid.tiles,y,x,x,0,
        bounds.top,bounds.left,bounds.bottom,bounds.right,
        getIdx,(start,idx) => start + idx * bounds.width,
        filters ? setLayerValuesFiltered.bind(null,filters) : setLayerValuesFast
    );
    this.applyGrid = (x,y,grid,filters) => applyGrid2D(
        x,y,grid.tiles,grid.width,grid.height,
        bounds,getIdx,
        filters ? setLayerValuesFiltered.bind(null,filters) : setLayerValuesFast
    );
    this.filters = gridApplicationFilters;
}
export default CordHelper;
export { CordHelper, PASS_THROUGH }
