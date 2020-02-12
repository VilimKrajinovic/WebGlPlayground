function GLInstance(canvasID) {
    let canvas = document.getElementById(canvasID);
    let gl = canvas.getContext("webgl2");

    if (!gl) {
        console.error("WebGl context is not available");
        return null;
    }


    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.fClear = function () {
        this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT);
        return this;
    };

    gl.fCreateArrayBuffer = function (floatArray, isStatic) {

        if (isStatic === undefined) isStatic = true;

        let buffer = this.createBuffer();
        this.bindBuffer(this.ARRAY_BUFFER, buffer);
        this.bufferData(this.ARRAY_BUFFER, floatArray, (isStatic) ? this.STATIC_DRAW : this.DYNAMIC_DRAW);
        this.bindBuffer(this.ARRAY_BUFFER, null);
        return buffer;
    };

    gl.fSetSize = function (w, h) {
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.canvas.width = w;
        this.canvas.height = h;

        this.viewport(0, 0, w, h);
        return this;
    };


    return gl;
}