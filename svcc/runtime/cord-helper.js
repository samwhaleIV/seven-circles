function LayerHelper(layer,getIdx,getXY) {
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
            layer[i] = filter(
                position.x,position.y,value
            );
        }
    }
}

function CordHelper(map) {
    const baseData = map.baseData;
    const getIdx = (x,y) => x + y * map.columns;
    const getXY = idx => {
        const y = Math.floor(idx / map.columns);
        const x = idx - y * map.columns;
        return {x:x,y:y};
    }
    this.background = new LayerHelper(
        baseData.background,getIdx,getXY
    );
    this.foreground = new LayerHelper(
        baseData.foreground,getIdx,getXY
    );
    this.collision = new LayerHelper(
        baseData.collision,getIdx,getXY
    );
    let getLayerValues;
    let layerCount;
    const layers = [
        this.background,this.foreground,this.collision
    ];
    if(baseData.lighting) {
        this.lighting = new LayerHelper(
            baseData.lighting,getIdx
        );
        layerCount = 4;
        getLayerValues = (x,y) => [
            this.background.get(x,y),
            this.foreground.get(x,y),
            this.collision.get(x,y),
            this.lighting.get(x,y)
        ];
        layers.push(this.lighting);
    } else {
        layerCount = 3;
        getLayerValues = (x,y) => [
            this.background.get(x,y),
            this.foreground.get(x,y),
            this.collision.get(x,y)
        ];
    }
    this.get = (x,y) => {
        return getLayerValues(x,y);
    }
    this.remap = filter => {
        const length = baseData.background.length;
        for(let i = 0;i<length;i++) {
            const position = getXY(i);
            const values = getLayerValues(
                position.x,position.y
            );
            const filterResult = filter(
                values,position.x,position.y
            );
            for(let layerID = 0;layerID<layerCount;layerID++) {
                const layer = layers[layerID];
                layer.set(
                    position.x,
                    position.y,
                    filterResult[layerID]
                );
            }
        }
    }
}
export default CordHelper;
