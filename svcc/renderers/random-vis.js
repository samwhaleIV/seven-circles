function RandomVisRenderer() {
    //import("./svcc/renderers/random-vis.js").then(module => rendererState.fader.fadeOut(module.default))

    this.noPixelScale = true;
    this.disableAdaptiveFill = true;

    console.log("Seed: " + Math.random.seed);

    const STRIDE_SIZE = 100;
    const STRIDE_SETS = 10;

    const stride = left => {
        for(let i = 0;i<STRIDE_SIZE;i++) {
            const random1 = Math.random();
            const random2 = Math.random();
            let x = Math.floor(random1 * halfWidth);
            const y = Math.floor(random2 * fullHeight);
            if(!left) {
                x += halfWidth;
            }
            context.rect(x,y,1,1);
        }
    };

    const strideAll = left => {
        if(left) {
            Math.random.seedify();
        } else {
            Math.random.purify();
        }
        context.fillStyle = `rgba(${
            Math.floor(Math.random()*255)
        },${
            Math.floor(Math.random()*255)
        },${
            Math.floor(Math.random()*255)
        },0.5)`;
        context.beginPath();
        for(let i = 0;i<STRIDE_SETS;i++) {
            stride(left);
        }
        context.fill();
    };

    this.start = getContextClearer();
    this.render = () => {
        tryRenderBufferContext();
        strideAll(true);
        strideAll(false);
    }
}
export default RandomVisRenderer;
