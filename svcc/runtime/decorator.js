import InstallLogic from "./logic-bind.js";

const INVALID_COUNT_SPECIFICATION = "Cannot use maxCount and fill attribute simultaneously!";
const INVALID_UNIFORM_DECORATION = "'qualifyObjectArea' must be unset for uniform decorations!"
const OBJECT_OR_OBJECTS_REQUIRED = "'object' or 'objects' is required to decorate!";
const INVALID_UNIFORM_MAP = "A 'uniformMap' must be provided on its own!";

const proximityBase = function(base) {
    const matrix = this.matrix;
    const matrixCount = matrix.length;
    return function(x,y) {
        let xOffset, yOffset;
        for(let i = 0;i<matrixCount;i++) {
            [xOffset,yOffset] = matrix[i];
            const baseMatch = base.call(
                null,x+xOffset,y+yOffset
            );
            if(!baseMatch) {
                return false;
            }
        }
        return true;
    }
};
const getProximityLogic = matrix => proximityBase.bind({matrix:matrix});

const proximityMatrices = Object.entries({
    "leftSide": [
        [-1,1],[-1,0],[-1,1]
    ],
    "rightSide": [
        [1,-1],[1, 0],[1, 1]
    ],
    "bottomSide": [
        [-1,1],[0, 1],[1, 1]
    ],
    "topSide": [
        [-1,1],[0,-1],[1,-1]
    ],
    "surrounding": [
        [-1,1],[0,-1],[1,-1],
        [-1,0],       [1, 0],
        [-1,1],[0, 1],[1, 1]
    ]
}).reduce((matrixSets,[name,matrix]) => {
    matrixSets[name] = getProximityLogic(matrix);
    return matrixSets;
},{});

function Decorator(layerBridge) {
    this.logic = (function(){
        const layers = layerBridge.layers.getLayers();
        InstallLogic(this,([suffix,method]) => {
            layers.forEach(layer => {
                this[layer.name + suffix] = value => method.bind({
                    method: layer.get,
                    value: value
                });
            });
        });
        return this;
    }).call(Object.assign({
        "area": function({base,width,height}) {
            return function(startX,startY) {
                const xEnd = startX + width;
                const yEnd = startY + height;
                for(let x = startX;x<xEnd;x++) {
                for(let y = startY;y<yEnd;y++) {
                    const baseMatch = base.call(
                        null,x,y
                    );
                    if(!baseMatch) {
                        return false;
                    }
                }}
                return true;
            }
        },
        "offset": function({base,x,y}) {
            const xOffset = x;
            const yOffset = y;
            return function(x,y) {
                return base.call(null,x+xOffset,y+yOffset);
            }
        } 
    },proximityMatrices));

    this.uniformMap = (objects,target) => {
        const entries = Object.entries(objects);
        const size = entries.length;
        let objectsList = new Array(size);
        let uniformity = new Array(size);
        entries.forEach(([name,uniformFactor],index)=>{
            objectsList[index] = name;
            uniformity[index] = uniformFactor;
        });
        target.objects = objectsList;
        target.uniformity = uniformity;
        return target;
    }

    const getRootQualifier = (object,qualifier) => {
        const bridgedObject = layerBridge.bridge.get(object);
        let rootQualifier = qualifier;
        if(bridgedObject.width > 1 || bridgedObject.height > 1) {
            rootQualifier = (...parameters) => {
                return this.logic.area({
                    base: qualifier,
                    width: bridgedObject.width,
                    height: bridgedObject.height
                }).apply(null,parameters);
            }
        }
        return rootQualifier;
    };

    const uniformDecorate = (
            objects,maxObjects,matches,stamp,qualifier,uniformity
        ) => {
        objects = objects.map(object => {
            const rootQualifier = getRootQualifier(object,qualifier);
            return {
                stamp: Object.assign({
                    name: object
                },stamp),
                name: object,
                qualifier: rootQualifier
            }
        });
        let objectSelectionPool;
        if(!uniformity) {
            objectSelectionPool = objects;
        } else {
            objectSelectionPool = new Array();
            for(let i = 0;i<objects.length;i++) {
                const object = objects[i];
                let quantity = uniformity[i];
                if(!quantity) {
                    quantity = 1;
                }
                const start = objectSelectionPool.length;
                objectSelectionPool.length += quantity;
                objectSelectionPool.fill(object,start);
            }
        }

        let objectCount = 0;
        while(matches.length && objectCount < maxObjects) {
            const match = matches.popRandom();
            const object = objectSelectionPool.getRandom();
            const qualifierResult = object.qualifier.call(
                null,match.x,match.y
            );
            if(qualifierResult) {
                const ownStamp = object.stamp;
                ownStamp.x = match.x;
                ownStamp.y = match.y;
                layerBridge.stamp(ownStamp);
                objectCount++;
            } 
        }
        return objectCount;
    }

    const decorate = ({
        objects,
        object,
        uniformity,
        maxCount,
        fill,
        qualifier = () => true,
        qualifyObjectArea,
        stamp = {}
    }) => {
        if(maxCount !== undefined && fill !== undefined) {
            throw Error(INVALID_COUNT_SPECIFICATION);
        } else if(maxCount === undefined && fill === undefined) {
            fill = 1;
            maxCount = Infinity;
        }
        if(!maxCount < 1) {
            return 0;
        }
        const matches = [];

        layerBridge.layers.iterate(({x,y})=>{
            const qualifierResult = qualifier.call(null,x,y);
            if(qualifierResult) {
                matches.push({x:x,y:y});
            }
        });
        const matchCount = matches.length;
        if(!matchCount) {
            return 0;
        }

        const ownStamp = Object.assign({
            name: object
        },stamp);

        let maxObjects = 0;
        if(maxCount !== undefined) {
            maxObjects = maxCount;
        } else {
            maxObjects = Math.round(matchCount * fill);
        }
        if(maxObjects < 1) {
            return 0;
        }

        if(objects && Array.isArray(objects)) {
            if(qualifyObjectArea !== undefined) {
                throw Error(INVALID_UNIFORM_DECORATION);
            }
            if(!uniformity) {
                uniformity = {};
            }
            const count = uniformDecorate(
                objects,maxObjects,matches,stamp,qualifier,uniformity
            );
            return count;
        } else if(!object) {
            return Error(OBJECT_OR_OBJECTS_REQUIRED);
        }

        if(qualifyObjectArea === undefined) {
            qualifyObjectArea = true;
        }

        let rootQualifier = qualifier;
        if(qualifyObjectArea) {
            rootQualifier = getRootQualifier(object,qualifier);
        }

        let objectCount = 0;
        while(matches.length && objectCount < maxObjects) {
            const match = matches.popRandom();
            const qualifierResult = rootQualifier.call(
                null,match.x,match.y
            );
            if(qualifierResult) {
                ownStamp.x = match.x;
                ownStamp.y = match.y;
                layerBridge.stamp(ownStamp);
                objectCount++;
            } 
        }
        return objectCount;
    }

    this.decorate = ({
        object,
        fill,
        maxCount,
        qualifier,
        stamp,
        qualifyObjectArea,
    }) => {
        return decorate({
            object: object,
            fill: fill,
            maxCount: maxCount,
            qualifier: qualifier,
            stamp: stamp,
            qualifyObjectArea: qualifyObjectArea
        });
    }
    this.decorateGroup = ({
        objects,
        uniformity,
        fill,
        maxCount,
        qualifier,
        stamp,
        uniformMap
    }) => {
        if(uniformMap) {
            if(objects || uniformity) {
                throw Error(INVALID_UNIFORM_MAP);
            }
            const uniformMapData = this.uniformMap(uniformMap,{});
            objects = uniformMapData.objects;
            uniformity = uniformMapData.uniformity;
        }
        return decorate({
            objects: objects,
            uniformity: uniformity,
            fill: fill,
            maxCount: maxCount,
            qualifier: qualifier,
            stamp
        });
    }

    this.getParameterSet = () => {
        return [this.decorate,this.decorateGroup,this.logic];
    }
}
export default Decorator;
