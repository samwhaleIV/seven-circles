import MapGen from "./map-gen.js";
import PinkPlace from "./map-generators/pink-place.js";
import WaterPlace from "./map-generators/water-place.js";

addMap("test-map",
    MapGen.NoiseMap(100,100)
);

addMap("pink-place",
    MapGen.External(100,100,PinkPlace)
);

addMap("water-place",
    MapGen.External(100,100,WaterPlace)
);
