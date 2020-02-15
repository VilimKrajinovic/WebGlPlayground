class GridFloor {
    constructor(gl, includeAxis) {
        this.transform = new Transform();
        this.gl = gl;
        this.createMesh(gl, includeAxis || false)
        this.createShader();
    }

    createShader() {
        let vertexShader = `#version 300 es
            in vec3 a_position;
            layout(location=4) in float a_color;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uCameraMatrix;
            uniform vec3 uColorArray[4];
            out lowp vec4 color;
            void main(void){
            color = vec4(uColorArray[ int(a_color) ],1.0);
            gl_Position = uProjectionMatrix * uCameraMatrix * uModelViewMatrix * vec4(a_position, 1.0);
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

        //Save colors in the shader. Should only need to render once.
        this.gl.useProgram(this.mShader);
        this.gl.uniform3fv(this.mUniformColor, new Float32Array([0.8, 0.8, 0.8, 1, 0, 0, 0, 1, 0, 0, 0, 1]));
        this.gl.useProgram(null);
    }

    render(camera) {
        //Update Transform Matrix (Modal View)
        this.transform.updateMatrix();

        //Prepare Shader
        this.gl.useProgram(this.mShader);
        this.gl.bindVertexArray(this.mesh.vao);

        //Push Uniforms
        this.gl.uniformMatrix4fv(this.mUniformProjection, false, camera.projectionMatrix);
        this.gl.uniformMatrix4fv(this.mUniformCamera, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.mUniformModelView, false, this.transform.getViewMatrix());

        //Draw Grid
        //this.gl.drawElements(this.mesh.drawMode, this.mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);
        this.gl.drawArrays(this.mesh.drawMode, 0, this.mesh.vertexCount);

        //Cleanup
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

    createMesh(gl, incAxis) {
        //Dynamiclly create a grid
        let verts = [],
            size = 2,			// W/H of the outer box of the grid, from origin we can only go 1 unit in each direction, so from left to right is 2 units max
            div = 10.0,			// How to divide up the grid
            step = size / div,	// Steps between each line, just a number we increment by for each line in the grid.
            half = size / 2;	// From origin the starting position is half the size.

        let p;	//Temp letiable for position value.
        for (let i = 0; i <= div; i++) {
            //Vertical line
            p = -half + (i * step);
            verts.push(p);		//x1
            verts.push(0);		//y1 verts.push(half);
            verts.push(half);	//z1 verts.push(0);
            verts.push(0);		//c2

            verts.push(p);		//x2
            verts.push(0);		//y2 verts.push(-half);
            verts.push(-half);	//z2 verts.push(0);	
            verts.push(0);		//c2 verts.push(1);

            //Horizontal line
            p = half - (i * step);
            verts.push(-half);	//x1
            verts.push(0);		//y1 verts.push(p);
            verts.push(p);		//z1 verts.push(0);
            verts.push(0);		//c1

            verts.push(half);	//x2
            verts.push(0);		//y2 verts.push(p);
            verts.push(p);		//z2 verts.push(0);
            verts.push(0);		//c2 verts.push(1);
        }

        if (incAxis) {
            //x axis
            verts.push(-1.1);	//x1
            verts.push(0);		//y1
            verts.push(0);		//z1
            verts.push(1);		//c2

            verts.push(1.1);	//x2
            verts.push(0);		//y2
            verts.push(0);		//z2
            verts.push(1);		//c2

            //y axis
            verts.push(0);//x1
            verts.push(-1.1);	//y1
            verts.push(0);		//z1
            verts.push(2);		//c2

            verts.push(0);		//x2
            verts.push(1.1);	//y2
            verts.push(0);		//z2
            verts.push(2);		//c2

            //z axis
            verts.push(0);		//x1
            verts.push(0);		//y1
            verts.push(-1.1);	//z1
            verts.push(3);		//c2

            verts.push(0);		//x2
            verts.push(0);		//y2
            verts.push(1.1);	//z2
            verts.push(3);		//c2
        }

        //Setup
        let attributeColorLocation = 4,
            strideLength,
            mesh = {drawMode: gl.LINES, vao: gl.createVertexArray()};

        //Do some math
        mesh.vertexComponentLen = 4;
        mesh.vertexCount = verts.length / mesh.vertexComponentLen;
        strideLength = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLen; //Stride Length is the Vertex Size for the buffer in Bytes

        //Setup our Buffer
        mesh.bufferVertices = gl.createBuffer();
        gl.bindVertexArray(mesh.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufferVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ATTRIBUTE_POSITION_LOCATION);
        gl.enableVertexAttribArray(attributeColorLocation);

        gl.vertexAttribPointer(ATTRIBUTE_POSITION_LOCATION, 3, gl.FLOAT, false, strideLength, 0);
        gl.vertexAttribPointer(attributeColorLocation, 1, gl.FLOAT, false, strideLength, Float32Array.BYTES_PER_ELEMENT * 3);

        //Cleanup and Finalize
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.mMeshCache["grid"] = mesh;
        this.mesh = mesh;
    }
}
