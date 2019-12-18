const DEFAULT_REGISTER_METHOD = null;

function CollisionHelper(values) {
    let collisionStart = CUSTOM_COLLISION_START;

    const registry = {};
    const registryLookup = {};
    const createNewRegister = name => {
        const register = {
            name: name,
            type: collisionStart,
            method: DEFAULT_REGISTER_METHOD
        };
        registryLookup[collisionStart] = register;
        registry[name] = register;
        collisionStart += 1;
    }
    const registerExists = name => {
        return name in registry;
    }

    const getRegister = name => {
        if(!registerExists(name)) {
            createNewRegister(name);
        }
        return registry[name];
    }

    this.setType = (name,method) => {
        const register = getRegister(name);
        if(method !== undefined) {
            register.method = method ? method : DEFAULT_REGISTER_METHOD;
        }
    }

    if(typeof values === "object") {
        values = Object.entries(values);
    }
    if(Array.isArray(values)) {
        values.forEach(([name,method]) => this.setType(name,method));
    }

    this.triggerLink = target => {
        return (function triggerMatch(...parameters) {
            const mapValue = parameters[0];
            if(mapValue in registryLookup) {
                const register = registryLookup[mapValue];
                if(register.method !== DEFAULT_REGISTER_METHOD) {
                    register.method.apply(this,parameters);
                }
            }
        }).bind(target);
    }

    this.fillMatch = ({name}) => getRegister(name).type;
}
export default CollisionHelper;
