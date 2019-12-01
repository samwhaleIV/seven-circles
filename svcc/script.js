"use strict";

import SVCCWorldRenderer from "./renderers/world.js";

const loadCallback = () => {
    if(!SoundManager.soundsLoaded || !ImageManager.imagesLoaded) {
        return;
    }
    BitmapText.verifyBitmap();
    setRendererState({
        noPixelScale: true,
        disableAdaptiveFill: true,
        render: function(){
            drawLoadingText()
        }
    });
    //todo preload fader effect renderer
    startRenderer();
    setFaderEffectsRenderer({render:function(){}});
    const firstRendererState = SVCCWorldRenderer;
    const loadParameters = [];
    rendererState.fader.fadeOut(firstRendererState,...loadParameters);
    rendererState.fader.didSetRendererState = () => {
        if(rendererState.song && !rendererState.songIntro) {
            const fancyEncodingData = SongsWithTheNewFancyIntroEncoding[
                rendererState.song
            ];
            if(fancyEncodingData) {
                rendererState.fancyEncodingData = fancyEncodingData;
            }
        }
        let oldFaderComplete = null;
        if(rendererState.faderCompleted) {
            oldFaderComplete = rendererState.faderCompleted.bind(rendererState);
        }
        rendererState.faderCompleted = () => {
            if(oldFaderComplete) {
                oldFaderComplete();
            }
            setFaderDelay(400);
            setFaderDuration(600);
            //todo set fader effect renderer
        }
    }
}
setImageIndexMode(IndexModes.LoseRoot);
ImageManager.loadImages(loadCallback);
SoundManager.loadSounds(loadCallback);

drawLoadingText();
setPageTitle("Seven Circles");
setFaderDelay(0);
setFaderDuration(musicFaderSafetyBuffer);
setMusicFadeDuration(0);
