//Global constants
const ATTRIBUTE_POSITION_NAME = "aPosition";
const ATTRIBUTE_POSITION_LOCATION = 0;
const ATTRIBUTE_NORMAL_NAME = "aNormal";
const ATTRIBUTE_NORMAL_LOCATION = 1;
const ATTRIBUTE_UV_NAME = "aUv";
const ATTRIBUTE_UV_LOCATION = 2;


class GlUtil {
    static toRgbArray() {
        if (arguments.length === 0) {
            return null;
        }
        let rtn = [];

        for (let i = 0, c, p; i < arguments.length; i++) {
            if (arguments[i].length < 6) {
                continue;
            }
            c = arguments[i];
            p = (c[0] === "#") ? 1 : 0;

            rtn.push(
                parseInt(c[p] + c[p + 1], 16) / 255,
                parseInt(c[p + 2] + c[p + 3], 16) / 255,
                parseInt(c[p + 4] + c[p + 5], 16) / 255
            );
        }

        return rtn;
    }
}

function GLInstance(canvasID) {
    let canvas = document.getElementById(canvasID);
    let gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl2"));

    if (!gl) {
        console.error("WebGl context is not available");
        return null;
    }

    gl.mMeshCache = [];
    gl.mTextureCache = [];

    //Setup GL
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

    gl.fCreateMeshVAO = function (name, arrayIndex, arrayVertex, arrayNormals, arrayUvs, vertexLength) {
        let rtn = {drawMode: this.TRIANGLES};

        rtn.vao = this.createVertexArray();
        this.bindVertexArray(rtn.vao);

        if (arrayVertex !== undefined && arrayVertex != null) {
            rtn.bufferVertices = this.createBuffer();
            rtn.vertexComponentLength = vertexLength || 3;
            rtn.vertexCount = arrayVertex.length / rtn.vertexComponentLength;

            this.bindBuffer(this.ARRAY_BUFFER, rtn.bufferVertices);
            this.bufferData(this.ARRAY_BUFFER, new Float32Array(arrayVertex), this.STATIC_DRAW);
            this.enableVertexAttribArray(ATTRIBUTE_POSITION_LOCATION);
            this.vertexAttribPointer(ATTRIBUTE_POSITION_LOCATION, rtn.vertexComponentLength, this.FLOAT, false, 0, 0);
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
        }

        this.bindVertexArray(null);
        this.bindBuffer(this.ARRAY_BUFFER, null);

        if (arrayIndex != null && arrayIndex !== undefined) this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, null);

        this.mMeshCache[name] = rtn;
        return rtn;
    }

    gl.fLoadCubeMap = function (name, imageArray) {
        if (imageArray.length !== 6) {
            return null;
        }

        let texture = this.createTexture();
        this.bindTexture(this.TEXTURE_CUBE_MAP, texture);

        for (let i = 0; i < 6; i++) {
            this.texImage2D(this.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, imageArray[i]);
        }

        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MAG_FILTER, this.LINEAR);
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MIN_FILTER, this.LINEAR);
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
        this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_R, this.CLAMP_TO_EDGE);

        this.bindTexture(this.TEXTURE_CUBE_MAP, null);
        this.mTextureCache[name] = texture;
        return texture;
    };

    gl.fLoadTexture = function (name, image, doYFlip, noMipMaps) {

        let texture = this.createTexture();
        this.mTextureCache[name] = texture;
        return this.fUpdateTexture(name, image, doYFlip, noMipMaps);

    }

    gl.fUpdateTexture = function (name, image, doYFlip, noMipMaps) {
        let texture = this.mTextureCache[name];

        if (doYFlip === true) {
            this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true); //flips the uv upside down, useful if mesh comes with an upside down UV
        }

        this.bindTexture(this.TEXTURE_2D, texture);
        this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, image);

        if (noMipMaps === undefined || noMipMaps === false) {
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST);
            this.generateMipmap(this.TEXTURE_2D);
        } else {
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.NEAREST);
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.NEAREST);
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
        }

        this.bindTexture(this.TEXTURE_2D, null);

        if (doYFlip === true) {
            this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);
        }

        return texture;
    };

    gl.fSetSize = function (w, h) {
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";
        this.canvas.width = w;
        this.canvas.height = h;

        this.viewport(0, 0, w, h);
        return this;
    };

    gl.fFitScreen = function (wp, hp) {
        return this.fSetSize(window.innerWidth * (wp || 1), window.innerHeight * (hp || 1));
    };


    return gl;
}