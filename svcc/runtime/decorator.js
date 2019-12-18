import InstallLogic from "./logic-bind.js";

const INVALID_COUNT_SPECIFICATION = "Cannot use maxCount and fill attribute simultaneously!";

function Decorator(layerBridge) {
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
    }).call({
        "leftSide": proximityBase.bind({matrix:[
            [-1,1],[-1,0],[-1,1],
        ]}),
        "rightSide": proximityBase.bind({matrix:[
            [1,-1],[1, 0],[1, 1]
        ]}),
        "bottomSide": proximityBase.bind({matrix:[
            [-1,1],[0, 1],[1, 1]
        ]}),
        "topSide": proximityBase.bind({matrix:[
            [-1,1],[0,-1],[1,-1]
        ]}),
        "surrounding": proximityBase.bind({matrix:[
            [-1,1],[0,-1],[1,-1],
            [-1,0],       [1, 0],
            [-1,1],[0, 1],[1, 1]
        ]}),
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
    });

    this.decorate = ({
        object,
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

        let remainingObjects = 0;
        if(maxCount !== undefined) {
            remainingObjects = maxCount;
        } else {
            remainingObjects = Math.round(matchCount * fill);
        }
        if(!remainingObjects) {
            return 0;
        }

        let rootQualifier;
        if(qualifyObjectArea) {
            const bridgedObject = layerBridge.bridge.get(object);
            rootQualifier = (...parameters) => {
                return this.logic.area({
                    base: qualifier,
                    width: bridgedObject.width,
                    height: bridgedObject.height
                }).apply(null,parameters);
            }
        } else {
            rootQualifier = qualifier;
        }

        let objectCount = 0;
        for(let i = 0;i < matchCount && remainingObjects > 0;i++) {
            const match = removeRandomEntry(matches);
            const qualifierResult = rootQualifier.call(
                null,match.x,match.y
            );
            if(qualifierResult) {
                ownStamp.x = match.x;
                ownStamp.y = match.y;
                layerBridge.stamp(ownStamp);
                remainingObjects--;
                objectCount++;
            }
        }
        return objectCount;
    }
}
export default Decorator;
