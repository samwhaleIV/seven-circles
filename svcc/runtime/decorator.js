import InstallLogic from "./logic-bind.js";

const INVALID_COUNT_SPECIFICATION = "Cannot use maxCount and fill attribute simultaneously!";

function Decorator(layerBridge) {
    this.layerLogic = (function(){
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
        "left-side": null,//todo
        "right-side": null,//todo
        "bottom-side": null,//todo
        "top-side": null,//todo
        "surrounding": function(base) {
            const SURROUNDING_MATRIX = [
                [-1,1],[0,-1],[1,-1],
                [-1,0],[0, 0],[1, 0],
                [-1,1],[0, 1],[1, 1]
            ];
            const MATRIX_COUNT = SURROUNDING_MATRIX.length;
            return function(x,y) {
                let xOffset, yOffset;
                for(let i = 0;i<MATRIX_COUNT;i++) {
                    [xOffset,yOffset] = SURROUNDING_MATRIX[i];
                    const baseMatch = base.call(
                        null,x+xOffset,y+yOffset
                    );
                    if(!baseMatch) {
                        return false;
                    }
                }
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
        maxCount,
        fill,
        qualifier = () => true,
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
        const ownStamp = Object.assign({},stamp);

        let remainingObjects = 0;
        if(maxCount !== undefined) {
            remainingObjects = maxCount;
        } else {
            remainingObjects = Math.round(matchCount * fill);
        }
        if(!remainingObjects) {
            return 0;
        }

        let objectCount = 0;
        for(let i = 0;i < matchCount && remainingObjects > 0;i++) {
            const match = removeRandomEntry(matches);
            const qualifierResult = qualifier.call(
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
