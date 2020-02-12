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
}