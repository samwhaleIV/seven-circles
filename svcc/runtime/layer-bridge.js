const NO_LIGHTING_LAYER = "No lighting layer for this layer data";
const NO_INCLUDED_LAYERS = "No layers included stamp operation";

const ONE_DIMENSIONAL_STAMP_BAD_OFFSET = "One dimensional stamps don't support x,y offset";
const TWO_DIMENSIONAL_STAMP_BAD_OFFSET = "Two dimensional stamps don't support x,y offset";

const NAME_AND_OBJECT_CONFLICT = "Cannot provide an object name with an object";
const INVALID_STAMP_LOCATION = "X or Y is invalid for this stamp operation";

const defaultToZero = value => !isNaN(value) ? value : 0;

function LayerBridge(layers,bridge) {
    const getGridGroup = (gridLayer,...layers) => {
        const gridGroup = bridge.getGridGroup(layers.map(layer => {
            if(layer) {
                if(typeof layer !== "boolean") {
                    return layer;
                } else {
                    return gridLayer;
                }
            } else {
                return null;
            }
        }));
        return gridGroup;
    };
    const applyGridLayer = (
        method,x,y,gridLayer,toBackground,toForeground,collisionLayer,toLighting
    ) => {
        const gridGroup = getGridGroup(
            gridLayer,toBackground,toForeground,collisionLayer,toLighting
        );
        method.call(null,x,y,gridGroup,gridGroup.filter);
    };
    const canUseSingleLayerApplication = layers => {
        const layerCount = layers.reduce((total,value) => {
            return value ? total + 1 : total
        },0);
        return layerCount <= 1;
    }
    const getNormalLayer = (
        toBackground,toForeground,toCollision,toLighting
    ) => {
        if(toBackground) {
            return layers.background;
        } else if(toForeground) {
            return layers.foreground;
        } else if(toCollision) {
            return layers.collision;
        } if(toLighting) {
            if(!layers.lighting) {
                throw Error(NO_LIGHTING_LAYER);
            } else {
                return layers.lighting;
            }
        } else {
            throw Error(NO_INCLUDED_LAYERS);
        }
    };
    const tryReduceObjectToGrid = (object,xOffset,yOffset,parameters) => {
        if(object.getGrid) {
            if(!parameters) {
                parameters = [];
            }
            object = object.getGrid.apply(null,parameters);
        } else {
            xOffset = defaultToZero(xOffset);
            yOffset = defaultToZero(yOffset);
            if(xOffset || yOffset) {
                object = object.offset(xOffset,yOffset);
            }
        }
        return object;
    }

    const generateCollisionLayer = (
        oneDimensional,length,collisionType,gridLayer
    ) => {
        let collisionLayer;
        if(oneDimensional) {
            collisionLayer = new Array(length);
            collisionLayer.fill(collisionType);
        } else {
            collisionLayer = bridge.getObject(
                gridLayer.width,
                gridLayer.height,
                collisionType
            );
        }
        return collisionLayer;
    };

    const generateGridLayer = (
        name,oneDimensional,length,xOffset,yOffset,parameters
    ) => {
        let object;
        if(typeof name === "object") {
            object = name;
        } else {
            object = bridge.get(name);
        }
        if(!object) {
            throw Error(`Object '${name}' does not exist in tile bridge`);
        }
        let gridLayer;
        if(oneDimensional) {
            gridLayer = object.getGrid.call(null,length);
        } else {
            gridLayer = tryReduceObjectToGrid(
                object,xOffset,yOffset,parameters
            );
        }
        return gridLayer;
    };

    const mapGridLayers = (
        x,y,singleLayerMode,oneDimensional,toCollision,
        layerSpecificity,method1D,gridLayer,collisionLayer
    ) => {
        if(!singleLayerMode) {
            let method;
            if(oneDimensional) {
                method = layers[method1D];
            } else {
                method = layers.applyGrid;
            }
            applyGridLayer(
                method,x,y,gridLayer,...layerSpecificity
            );
        } else {
            if(toCollision) {
                gridLayer = {
                    tiles: collisionLayer
                };
            }
            const normalLayer = getNormalLayer(
                ...layerSpecificity
            );
            if(oneDimensional) {
                const method = normalLayer[method1D];
                method.call(null,x,y,gridLayer);
            } else {
                normalLayer.applyGrid(
                    x,y,gridLayer
                );
            }
        }
    };

    const stamp = (
        name,x,y,collisionType,xOffset,yOffset,
        toBackground,toForeground,toLighting,parameters,method1D,length
    ) => {
        const oneDimensional = method1D !== undefined;

        let gridLayer = generateGridLayer(
            name,oneDimensional,length,xOffset,yOffset,parameters
        );
        let collisionLayer = null;


        const toCollision = collisionType !== undefined;
        if(toCollision) {
            collisionLayer = generateCollisionLayer(
                oneDimensional,length,collisionType,gridLayer
            );
        }
    
        const layerSpecificity = [
            toBackground,toForeground,collisionLayer,toLighting
        ];
        const singleLayerMode = canUseSingleLayerApplication(
            layerSpecificity
        );
        mapGridLayers(
            x,y,singleLayerMode,oneDimensional,toCollision,
            layerSpecificity,method1D,gridLayer,collisionLayer
        );
    };
    const dynamicStamp = (
        name,x,y,width,height,collisionType,
        toBackground,toForeground,toLighting,parameters
    ) => {
        if(!parameters) {
            parameters = [];
        }
        const xOffset = 0;
        const yOffset = 0;
        const stampParameters = [width,height,...parameters];
        stamp(
            name,x,y,collisionType,xOffset,yOffset,
            toBackground,toForeground,toLighting,
            stampParameters
        );
    };
    const stamp1D = (
        method,name,x,y,length,collisionType,
        toBackground,toForeground,toLighting,parameters
    ) => {
        stamp(
            name,x,y,collisionType,0,0,
            toBackground,toForeground,toLighting,
            parameters,method,length
        );
    };

    const stampHorizontal = (...parameters) => {
        stamp1D("applyHorizontalGrid",...parameters);
    };
    const stampVertical = (...parameters) => {
        stamp1D("applyVerticalGrid",...parameters);
    };

    this.stamp = ({
        name,x,y,xOffset,yOffset,width,height,collisionType,
        toBackground,toForeground,toLighting,parameters,object
    }) => {
        if(isNaN(x) && isNaN(y)) {
            throw Error(INVALID_STAMP_LOCATION);
        }
        if(!name && object) {
            name = object;
        } else if(name && object) {
            throw Error(NAME_AND_OBJECT_CONFLICT);
        }
        const hasOffset = xOffset !== undefined || yOffset !== undefined;
        if(width && height) {
            if(hasOffset) {
                throw Error(TWO_DIMENSIONAL_STAMP_BAD_OFFSET);
            }
            width = defaultToZero(width);
            height = defaultToZero(height);
            dynamicStamp(
                name,x,y,width,height,collisionType,
                toBackground,toForeground,toLighting,parameters
            );
        } else if(width || height) {
            if(hasOffset) {
                throw Error(ONE_DIMENSIONAL_STAMP_BAD_OFFSET);
            }
            let stampMethod;
            let size;
            if(width) {
                size = width;
                stampMethod = stampHorizontal;
            } else {
                size = height;
                stampMethod = stampVertical;
            }
            stampMethod(name,x,y,size,collisionType,
                toBackground,toForeground,toLighting,parameters
            );
        } else {
            stamp(
                name,x,y,collisionType,xOffset,yOffset,
                toBackground,toForeground,toLighting,parameters
            );
        }
    }

}
export default LayerBridge;
