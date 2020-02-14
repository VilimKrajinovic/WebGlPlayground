class GridAxisShader extends Shader {
    constructor(gl, projectionMatrix) {
        let vertexSource = `#version 300 es
            in vec3 aPosition;
            layout(location=4) in float aColour;
            
            uniform mat4 uProjectionMatrix;
            uniform mat4 uCameraMatrix;
            uniform mat4 uModelViewMatrix;
            uniform vec3 uColor[4];//Color Array
            
            out lowp vec4 color;//Color to send to fragment shader.
            
            void main(void){
                color = vec4(uColor[int(aColour)], 1.0);//Using the 4th float as a color index.
                gl_Position = uProjectionMatrix * uCameraMatrix *  uModelViewMatrix * vec4(aPosition, 1.0);
            }`;

        let fragmentSource = `#version 300 es
            precision mediump float;
            
            in vec4 color;
            out vec4 finalColor;
            
            void main(void){ finalColor = color; }`;

        super(gl, vertexSource, fragmentSource);
        this.setPerspective(projectionMatrix);

        let uColor = gl.getUniformLocation(this.program, "uColor");
        gl.uniform3fv(uColor, new Float32Array([0.8, 0.8, 0.8,   1, 0, 0,    0, 1, 0,    0, 0, 1]));

        gl.useProgram(null);

    }
}