const worldMaps = {};

/*
    What? Were you expecting something big and fancy that warranted this sole file for what is merely a lookup table?
*/

function addMap(name,map) {
    map.name = name;
    worldMaps[name] = map;
}

function deleteMap(name) {
    delete worldMaps[name];
}

