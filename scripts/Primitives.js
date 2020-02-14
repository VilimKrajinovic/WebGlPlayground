let Primitives = {};

Primitives.Quad = class {
    static createModel(gl) {
        return new Model(Primitives.Quad.createMesh(gl));
    }

    static createMesh(gl) {
        let aVertices = [
                -0.5, 0.5, 0,
                -0.5, -0.5, 0,
                0.5, -0.5, 0,
                0.5, 0.5, 0],
            aUv = [0, 0, 0, 1, 1, 1, 1, 0],
            aIndex = [0, 1, 2, 2, 3, 0];

        let mesh = gl.fCreateMeshVAO("Quad", aIndex, aVertices, null, aUv);
        mesh.noCulling = true;
        mesh.doBlending = true;
        return mesh;
    }

}

Primitives.GridAxis = class {

    static createModel(gl, includeAxis) {
        return new Model(Primitives.GridAxis.createMesh(gl, includeAxis))
    }

    static createMesh(gl, includeAxis) {
        let vertices = [],
            size = 1.8,			// W/H of the outer box of the grid, from origin we can only go 1 unit in each direction, so from left to right is 2 units max
            divisions = 10.0,			// How to divide up the grid
            step = size / divisions,	// Steps between each line, just a number we increment by for each line in the grid.
            half = size / 2;	// From origin the starting position is half the size.

        let position;
        for (let i = 0; i <= divisions; i++) {
            //Vertical line
            position = -half + (i * step);
            vertices.push(position);//x1
            vertices.push(0);		//y1
            vertices.push(half);	//z1
            vertices.push(0);		//c2

            vertices.push(position);//x2
            vertices.push(0);		//y2
            vertices.push(-half);	//z2
            vertices.push(0);		//c2

            //Horizontal line
            position = half - (i * step);
            vertices.push(-half);	//x1
            vertices.push(0);		//y1
            vertices.push(position);//z1
            vertices.push(0);		//c1

            vertices.push(half);	//x2
            vertices.push(0);		//y2
            vertices.push(position);//z2
            vertices.push(0);		//c2
        }

        if (includeAxis) {
            //x axis
            vertices.push(-1.1);
            vertices.push(0);
            vertices.push(0);
            vertices.push(1);

            vertices.push(1.1);
            vertices.push(0);
            vertices.push(0);
            vertices.push(1);

            // y axis
            vertices.push(0)
            vertices.push(-1.1);
            vertices.push(0);
            vertices.push(2);

            vertices.push(0);
            vertices.push(1.1);
            vertices.push(0);
            vertices.push(2);

            //z axis
            vertices.push(0);
            vertices.push(0);
            vertices.push(-1.1);
            vertices.push(3);

            vertices.push(0);
            vertices.push(0);
            vertices.push(1.1);
            vertices.push(3);
        }

        let attributeColourLocation = 4,
            strideLength,
            mesh = {drawMode: gl.LINES, vao: gl.createVertexArray()};

        mesh.vertexComponentLength = 4;
        mesh.vertexCount = vertices.length / mesh.vertexComponentLength;
        strideLength = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLength;


        mesh.bufferVertices = gl.createBuffer();
        gl.bindVertexArray(mesh.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufferVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ATTRIBUTE_POSITION_LOCATION);
        gl.enableVertexAttribArray(attributeColourLocation);

        gl.vertexAttribPointer(
            ATTRIBUTE_POSITION_LOCATION,    //attribute location
            3,                              //How big is the vector by number count
            gl.FLOAT,                       //what type of number were passsing in
            false,                          //should normalize?
            strideLength,                   //how big is a vertex chunk of data
            0                               //offset by how much
        );

        gl.vertexAttribPointer(
            attributeColourLocation,
            1,
            gl.FLOAT,
            false,
            strideLength,
            Float32Array.BYTES_PER_ELEMENT * 3 //skip first 3 floats in our chunk
        );

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.mMeshCache["grid"] = mesh;

        return mesh;
    }

}