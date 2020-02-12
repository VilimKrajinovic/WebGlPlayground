class RenderLoop {

    constructor(callback, fps) {
        let otherThis = this;
        this.msLastFrame = null;    //time in ms of the last frame
        this.callback = callback;   //what function to call for each frame
        this.isActive = false;      //control the on off state of the render loop
        this.fps = 0;               //how fast the loop is going

        if (!fps && fps > 0) {
            this.msFpsLimit = 1000 / fps;

            this.run = function () {
                let msCurrent = performance.now(),
                    msDelta = (msCurrent - otherThis.msLastFrame),
                    deltaTime = msDelta / 1000;

                if (msDelta > otherThis.msFpsLimit) {
                    otherThis.fps = Math.floor(1 / deltaTime);
                    otherThis.msLastFrame = msCurrent;
                    otherThis.callback(deltaTime);
                }

                if (otherThis.isActive) {
                    window.requestAnimationFrame(otherThis.run);
                }
            }
        } else {
            this.run = function () {
                let msCurrent = performance.now(),
                    deltaTime = (msCurrent - otherThis.msLastFrame) / 1000.0;

                otherThis.fps = Math.floor(1 / deltaTime);
                otherThis.msLastFrame = msCurrent;

                otherThis.callback(deltaTime);
                if (otherThis.isActive) {
                    window.requestAnimationFrame(otherThis.run)
                }
            }
        }
    }

    start()
    {
        this.isActive = true;
        this.msLastFrame = performance.now();
        window.requestAnimationFrame(this.run);
        return this;
    }

    stop()
    {
        this.isActive = false;
    }
}