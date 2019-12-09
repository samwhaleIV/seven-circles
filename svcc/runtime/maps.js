import MapGen from "./map-gen.js";
import PinkPlace from "./map-generators/pink-place.js";
import WaterTest from "./map-generators/water-test.js";

addMap("test-map",
    MapGen.NoiseMap(100,100)
);

addMap("pink-place",
    MapGen.External(100,100,PinkPlace)
);

addMap("water-test",
    MapGen.External(100,100,WaterTest)
);
