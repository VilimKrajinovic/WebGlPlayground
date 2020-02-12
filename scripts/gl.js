//Global constants
const ATTRIBUTE_POSITION_NAME = "aPosition";
const ATTRIBUTE_POSITION_LOCATION = 0;
const ATTRIBUTE_NORMAL_NAME = "aNormal";
const ATTRIBUTE_NORMAL_LOCATION = 1;
const ATTRIBUTE_UV_NAME = "aUv";
const ATTRIBUTE_UV_LOCATION = 2;


function GLInstance(canvasID) {
    let canvas = document.getElementById(canvasID);
    let gl = canvas.getContext("webgl2");

    if (!gl) {
        console.error("WebGl context is not available");
        return null;
    }

    gl.mMeshCache = [];

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

    gl.fCreateMeshVAO = function (name, arrayIndex, arrayVertex, arrayNormals, arrayUvs) {
        let rtn = {drawMode: this.TRIANGLES};
        rtn.vao = this.createVertexArray();

        if (arrayVertex !== undefined && arrayVertex != null) {
            rtn.bufferVertices = this.createBuffer();
            rtn.vertexComponentLength = 3;
            rtn.vertexCount = arrayVertex.length / rtn.vertexComponentLength;

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufferVertices);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrayVertex), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTRIBUTE_POSITION_LOCATION);
            this.vertexAttribPointer(ATTRIBUTE_POSITION_LOCATION, 3, this.FLOAT, false, 0, 0);
        }

        if (arrayNormals !== undefined && arrayNormals != null) {
            rtn.bufferNormals = this.createBuffer();

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufferNormals);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrayNormals), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTRIBUTE_NORMAL_LOCATION);
            this.vertexAttribPointer(ATTRIBUTE_NORMAL_LOCATION, 3, this.FLOAT, false, 0, 0);
        }

        if (arrayUvs !== undefined && arrayUvs != null) {
            rtn.bufferUvs = this.createBuffer();

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufferUvs);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrayUvs), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTRIBUTE_UV_LOCATION);
            this.vertexAttribPointer(ATTRIBUTE_UV_LOCATION, 2, this.FLOAT, false, 0, 0);
        }

        if (arrayIndex !== undefined && arrayIndex != null) {
            rtn.bufferIndex = this.createBuffer();
            rtn.indexCount = arrayIndex.length;

            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.bufferIndex);
            this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrayIndex), this.STATIC_DRAW);
            this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null);
        }

        this.bindVertexArray(null);
        this.bindBuffer(this.ARRAY_BUFFER, null);

        this.mMeshCache[name] = rtn;
        return rtn;
    }

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