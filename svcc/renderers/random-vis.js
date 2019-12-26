function RandomVisRenderer() {
    this.noPixelScale = true;
    this.disableAdaptiveFill = true;

    //Math.random.seedify();
    //Math.random.seed = 152792162880201;
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
    }
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
            Math.floor(Math.random()*0)
        },0.5)`;
        context.beginPath();
        for(let i = 0;i<STRIDE_SETS;i++) {
            stride(left);
        }
        context.fill();
    }
    let lastFrame = 0;
    this.render = timestamp => {
        context.save();
        //context.translate((timestamp-lastFrame)/-100,0);
        lastFrame = timestamp;
        tryRenderBufferContext();
        context.restore();
        strideAll(true);
        strideAll(false);
    }
}
export default RandomVisRenderer;
