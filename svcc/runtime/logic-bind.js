const equal = function(...parameters) {
    return this.method.apply(null,parameters) === this.value;
}
const notEqual = function(...parameters) {
    return this.method.apply(null,parameters) !== this.value;
}
const less = function(...parameters) {
    return this.method.apply(null,parameters) < this.value;
}
const greater = function(...parameters) {
    return this.method.apply(null,parameters) > this.value;
}
const greaterOrEqual = function(...parameters) {
    return this.method.apply(null,parameters) >= this.value;
}
const lessOrEqual = function(...parameters) {
    return this.method.apply(null,parameters) <= this.value;
}
const group = function(allInclusive,...qualifiers) {
    const qualifierCount = qualifiers.length;
    return function(...parameters) {
        for(let i = 0;i<qualifierCount;i++) {
            const qualifier = qualifiers[i];
            const result = qualifier.apply(null,parameters);
            if(allInclusive) {
                if(!result) {
                    return false;
                }
            } else {
                if(result) {
                    return true;
                }
            }
        }
        return allInclusive;
    }
}
const and = group.bind(null,true);
const or = group.bind(null,false);

const not = qualifier => {
    return function(...parameters) {
        return !qualifier.apply(null,parameters);
    }
}

const LOGIC_BINDS = Object.entries({
    "Equals": equal,
    "DoesNotEqual": notEqual,
    "LessThan": less,
    "GreaterThan": greater,
    "GreaterThanOrEqualTo": greaterOrEqual,
    "LessThanOrEqualTo": lessOrEqual
});

function InstallLogic(target,installer) {
    target.and = and;
    target.or = or;
    target.not = not;
    LOGIC_BINDS.forEach(installer);
}

export default InstallLogic;
