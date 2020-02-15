class VertexDebugger {
    constructor(gl, pointSize) {
        this.transform = new Transform();
        this.gl = gl;
        this.mColor = [];
        this.mVerts = [];
        this.mVertexBuffer = 0;
        this.mVertexCount = 0;
        this.mVertexComponentLen = 4;
        this.mPointSize = pointSize;
    }

    addColor() {
        if (arguments.length === 0) {
            return this;
        }

        for (let i = 0, c, p; i < arguments.length; i++) {
            if (arguments[i].length < 6) {
                continue;
            }
            c = arguments[i];
            p = (c[0] === "#") ? 1 : 0;

            this.mColor.push(
                parseInt(c[p] + c[p + 1], 16) / 255,
                parseInt(c[p + 2] + c[p + 3], 16) / 255,
                parseInt(c[p + 4] + c[p + 5], 16) / 255
            );
        }
        return this;
    }

    addPoint(x1, y1, z1, cIndex) {
        this.mVerts.push(x1, y1, z1, cIndex || 0);
        this.mVertexCount = this.mVerts.length / this.mVertexComponentLen;
        return this;
    }

    addMeshPoints(cIndex, mesh) {
        if (mesh.aVert === undefined) {
            return this;
        }

        let len = mesh.aVert.length;
        for (let i = 0; i < len; i += 3) {
            this.mVerts.push(
                mesh.aVert[i],
                mesh.aVert[i + 1],
                mesh.aVert[i + 2],
                cIndex
            );
        }
        this.mVertexCount = this.mVerts.length / this.mVertexComponentLen;
        return this;
    }

    createShader() {
        let vertexShader = `#version 300 es
            layout(location=0) in vec4 a_position;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uCameraMatrix;
            uniform mat4 uModelViewMatrix;
            uniform vec3 uColorArray[6];
            uniform vec3 uCameraPosition;
            uniform float uPointSize;
            out lowp vec4 color;
            void main(void){
            vec4 pos = uModelViewMatrix * vec4(a_position.xyz, 1.0);
            color = vec4(uColorArray[ int(a_position.w) ],1.0);
            gl_PointSize = (1.0 - distance( uCameraPosition, pos.xyz ) / 10.0 ) * uPointSize;
            gl_Position = uProjectionMatrix * uCameraMatrix * pos;
            }`;

        let fragmentShader = `#version 300 es
            precision mediump float;
            in vec4 color;
            out vec4 finalColor;
            void main(void){ finalColor = color; }`;

        this.mShader = ShaderUtil.createProgramFromText(this.gl, vertexShader, fragmentShader, true);
        this.mUniformColor = this.gl.getUniformLocation(this.mShader, "uColorArray");
        this.mUniformProjection = this.gl.getUniformLocation(this.mShader, "uProjectionMatrix");
        this.mUniformCamera = this.gl.getUniformLocation(this.mShader, "uCameraMatrix");
        this.mUniformModelView = this.gl.getUniformLocation(this.mShader, "uModelViewMatrix");
        this.mUniformPointSize = this.gl.getUniformLocation(this.mShader, "uPointSize");
        this.mUniformCameraPosition = this.gl.getUniformLocation(this.mShader, "uCameraPosition");

        //Save colors in the shader. Should only need to render once.
        this.gl.useProgram(this.mShader);
        this.gl.uniform3fv(this.mUniformColor, new Float32Array(this.mColor));
        this.gl.uniform1f(this.mUniformPointSize, this.mPointSize);
        this.gl.useProgram(null);
    }

    finalize() {
        this.mVertexBuffer = this.gl.fCreateArrayBuffer(new Float32Array(this.mVerts), true);
        this.createShader();
        return this;
    }

    render(camera) {
        //update transform matrix
        this.transform.updateMatrix();

        this.gl.useProgram(this.mShader);

        this.gl.uniformMatrix4fv(this.mUniformProjection, false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mUniformCamera, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.mUniformModelView, false, this.transform.getViewMatrix());
        this.gl.uniform3fv(this.mUniformCameraPosition, new Float32Array(camera.transform.position.getArray()));

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, this.mVertexComponentLen, this.gl.FLOAT, false, 0, 0);

        this.gl.drawArrays(this.gl.POINTS, 0, this.mVertexCount);

        this.gl.disableVertexAttribArray(0);
        this.gl.useProgram(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }


}