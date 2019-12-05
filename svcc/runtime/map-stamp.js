function MapStamp(layers,bridge) {
    const applyGridLayer = (
        x,y,gridLayer,collisionLayer,isForeground,method
    ) => {
        let layer1, layer2;
        if(isForeground) {
            layer1 = null;
            layer2 = gridLayer;
        } else {
            layer1 = gridLayer;
            layer2 = null;
        }
        const gridGroup = bridge.getGridGroup([
            layer1,layer2,collisionLayer
        ]);
        method.call(null,x,y,gridGroup,gridGroup.filter);
    }
    const getNormalLayer = isForeground => {
        if(isForeground) {
            return layers.foreground;
        } else {
            return layers.background;
        }
    }
    const stamp = (
        name,x,y,collisionType,xOffset,yOffset,stampParameters,isForeground
    ) => {
        let object = bridge.get(name);
        if(object.getGrid) {
            if(!stampParameters) {
                stampParameters = [];
            }
            object = object.getGrid(...stampParameters);
        } else {
            xOffset = !isNaN(xOffset) ? xOffset : 0;
            yOffset = !isNaN(yOffset) ? yOffset : 0;
            if(xOffset || yOffset) {
                object = object.offset(xOffset,yOffset);
            }
        }
        if(collisionType !== undefined) {
            const gridLayer = object;
            const collisionLayer = bridge.getObject(
                gridLayer.width,
                gridLayer.height,
                collisionType
            );
            applyGridLayer(
                x,y,gridLayer,collisionLayer,isForeground,layers.applyGrid
            );
        } else {
            getNormalLayer(isForeground).applyGrid(x,y,object);
        }
    };
    this.stampForeground = (name,x,y,collisionType,xOffset,yOffset) => {
        stamp(name,x,y,collisionType,xOffset,yOffset,null,true);
    };
    this.stampBackground = (name,x,y,collisionType,xOffset,yOffset) => {
        stamp(name,x,y,collisionType,xOffset,yOffset,null,false);
    };
    const dynamicStamp = (name,x,y,width,height,collisionType,isForeground,parameters) => {
        stamp(name,x,y,collisionType,0,0,[width,height,...parameters],isForeground);
    }
    this.stampBackgroundDynamic = (name,x,y,width,height,collisionType,...parameters) => {
        dynamicStamp(name,x,y,width,height,collisionType,false,parameters);
    }
    this.stampForegroundDynamic = (name,x,y,width,height,collisionType,...parameters) => {
        dynamicStamp(name,x,y,width,height,collisionType,true,parameters);
    }
    const stamp1D = (method,name,x,y,length,collisionType,isForeground,parameters) => {
        const object = bridge.get(name);
        if(collisionType !== undefined) {
            const collisionLayer = new Array(length);
            collisionLayer.fill(collisionType);
            const gridLayer = object.getGrid(length);
            applyGridLayer(
                x,y,gridLayer,collisionLayer,isForeground,layers[method]
            );
        } else {
            getNormalLayer(isForeground)[method].call(null,x,y,object);
        }
    };
    const stampHorizontal = (...parameters) => {
        stamp1D("applyHorizontalGrid",...parameters);
    };
    const stampVertical = (...parameters) => {
        stamp1D("applyVerticalGrid",...parameters)
    };
    this.stampHorizontalForeground = (name,x,y,length,collisionType) => {
        stampHorizontal(name,x,y,length,collisionType,true);
    }
    this.stampHorizontalBackground = (name,x,y,length,collisionType) => {
        stampHorizontal(name,x,y,length,collisionType,false);
    }
    this.stampVerticalForeground = (name,x,y,length,collisionType) => {
        stampVertical(name,x,y,length,collisionType,true);
    }
    this.stampVerticalBackground = (name,x,y,length,collisionType) => {
        stampVertical(name,x,y,length,collisionType,false);    
    }

}
export default MapStamp;
