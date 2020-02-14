class Shader {

    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.program = ShaderUtil.createProgramFromText(gl, vertexShaderSource, fragmentShaderSource, true);

        if (this.program != null) {
            this.gl = gl;
            gl.useProgram(this.program);
            this.attributeLocation = ShaderUtil.getStandardAttributeLocations(gl, this.program);
            this.uniformLocation = ShaderUtil.getStandardUniformLocations(gl, this.program);
        }
    }

    activate() {
        this.gl.useProgram(this.program);
        return this;
    }

    deactivate() {
        this.gl.useProgram(null);
        return this;
    }

    setPerspective(matrixData) {
        this.gl.uniformMatrix4fv(this.uniformLocation.perspective, false, matrixData);
        return this;
    }

    setModelMatrix(matrixData) {
        this.gl.uniformMatrix4fv(this.uniformLocation.modelMatrix, false, matrixData);
        return this;
    }

    setCameraMatrix(matrixData) {
        this.gl.uniformMatrix4fv(this.uniformLocation.cameraMatrix, false, matrixData);
        return this;
    }

    dispose() {
        if (this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) {
            this.gl.useProgram(null);
        }
        this.gl.deleteProgram(this.program);
    }

    preRender() {
        //abstract method, extended object implement it
    }

    renderModel(model) {
        this.setModelMatrix(model.transform.getViewMatrix());
        this.gl.bindVertexArray(model.mesh.vao);

        if (model.mesh.noCulling) this.gl.disable(gl.CULL_FACE);
        if (model.mesh.doBlending) this.gl.enable(gl.BLEND);


        if (model.mesh.indexCount) {
            this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);
        }

        this.gl.bindVertexArray(null);
        if (model.mesh.noCulling) this.gl.enable(gl.CULL_FACE);
        if (model.mesh.doBlending) this.gl.disable(gl.BLEND);
        return this;

    }
}

class ShaderUtil {

    static domShaderSrc(elementId) {
        let element = document.getElementById(elementId);
        if (!element || element.text === "") {
            console.log(elementId + " shader not found or no text");
            return null;
        }
        return element.text;
    }

    static createShader(gl, src, type) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Error compiling shader : " + src, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    static createProgram(gl, vertexShader, fragmentShader, doValidate) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.bindAttribLocation(program, ATTRIBUTE_POSITION_LOCATION, ATTRIBUTE_POSITION_NAME);
        gl.bindAttribLocation(program, ATTRIBUTE_NORMAL_LOCATION, ATTRIBUTE_NORMAL_NAME);
        gl.bindAttribLocation(program, ATTRIBUTE_UV_LOCATION, ATTRIBUTE_UV_NAME);

        gl.linkProgram(program);


        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Error creating  shader program.", gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }

        if (doValidate) {
            gl.validateProgram(program);
            if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                console.error("Error validating program", gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return null;
            }
        }

        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return program;
    }

    static domShaderProgram(gl, vertexId, fragmentId, doValidate) {
        let vertexShaderText = ShaderUtil.domShaderSrc(vertexId);
        if (!vertexShaderText) return null;

        let fragmentShaderText = ShaderUtil.domShaderSrc(fragmentId);
        if (!fragmentShaderText) return null;

        let vertexShader = ShaderUtil.createShader(gl, vertexShaderText, gl.VERTEX_SHADER);
        if (!vertexShader) return null;

        let fragmentShader = ShaderUtil.createShader(gl, fragmentShaderText, gl.FRAGMENT_SHADER);
        if (!fragmentShader) {
            gl.deleteShader(vertexShader);
            return null;
        }

        return ShaderUtil.createProgram(gl, vertexShader, fragmentShader, true);
    }

    static createProgramFromText(gl, vertexShaderText, fragmentShaderText, doValidate) {
        let vShader = ShaderUtil.createShader(gl, vertexShaderText, gl.VERTEX_SHADER);
        if (!vShader) {
            return null;
        }

        let fShader = ShaderUtil.createShader(gl, fragmentShaderText, gl.FRAGMENT_SHADER);
        if (!fShader) {
            gl.deleteShader(vShader);
            return null;
        }

        return ShaderUtil.createProgram(gl, vShader, fShader);
    }

    static getStandardAttributeLocations(gl, program) {
        return {
            position: gl.getAttribLocation(program, ATTRIBUTE_POSITION_NAME),
            normals: gl.getAttribLocation(program, ATTRIBUTE_NORMAL_NAME),
            uvs: gl.getAttribLocation(program, ATTRIBUTE_UV_NAME)
        };
    }

    static getStandardUniformLocations(gl, program) {
        return {
            perspective: gl.getUniformLocation(program, "uProjectionMatrix"),
            modelMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
            cameraMatrix: gl.getUniformLocation(program, "uCameraMatrix"),
            mainTexture: gl.getUniformLocation(program, "uMainTexture")
        };
    }

}
