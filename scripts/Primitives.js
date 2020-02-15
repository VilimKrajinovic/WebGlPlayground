let Primitives = {};

Primitives.Cube = class {
    static createModel(gl) {
        return new Model(Primitives.Cube.createMesh(gl, 1, 1, 1, 0, 0, 0));
    }

    static createMesh(gl, width, height, depth, x, y, z) {
        let w = width * 0.5,
            h = height * 0.5,
            d = depth * 0.5;
        let x0 = x - w,
            x1 = x + w,
            y0 = y - h,
            y1 = y + h,
            z0 = z - d,
            z1 = z + d;

        //Starting bottom left corner, then working counter clockwise to create the front face.
        //Backface is the first face but in reverse (3,2,1,0)
        //keep each quad face built the same way to make index and uv easier to assign
        let aVert = [
            x0, y1, z1, 0,	//0 Front
            x0, y0, z1, 0,	//1
            x1, y0, z1, 0,	//2
            x1, y1, z1, 0,	//3

            x1, y1, z0, 1,	//4 Back
            x1, y0, z0, 1,	//5
            x0, y0, z0, 1,	//6
            x0, y1, z0, 1,	//7

            x0, y1, z0, 2,	//7 Left
            x0, y0, z0, 2,	//6
            x0, y0, z1, 2,	//1
            x0, y1, z1, 2,	//0

            x0, y0, z1, 3,	//1 Bottom
            x0, y0, z0, 3,	//6
            x1, y0, z0, 3,	//5
            x1, y0, z1, 3,	//2

            x1, y1, z1, 4,	//3 Right
            x1, y0, z1, 4,	//2
            x1, y0, z0, 4,	//5
            x1, y1, z0, 4,	//4

            x0, y1, z0, 5,	//7 Top
            x0, y1, z1, 5,	//0
            x1, y1, z1, 5,	//3
            x1, y1, z0, 5	//4
        ];

        //Build the index of each quad [0,1,2, 2,3,0]
        let arrayIndex = [];
        for (let i = 0; i < aVert.length / 4; i += 2) {
            arrayIndex.push(i, i + 1, (Math.floor(i / 4) * 4) + ((i + 2) % 4));
        }

        //Build UV data for each vertex
        let arrayUv = [];
        for (let i = 0; i < 6; i++) {
            arrayUv.push(0, 0, 0, 1, 1, 1, 1, 0);
        }

        //Build Normal data for each vertex
        let arrayNormals = [
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,		//Front
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,		//Back
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,		//Left
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,		//Bottom
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,		//Right
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0		//Top
        ]

        let mesh = gl.fCreateMeshVAO("Cube", arrayIndex, aVert, arrayNormals, arrayUv, 4);
        mesh.noCulling = true;	//TODO Only setting this true to view animations better.
        return mesh;
    }
};


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
};

Primitives.MultiQuad = class {
    static createModel(gl) {
        return new Model(Primitives.MultiQuad.createMesh(gl))
    }

    static createMesh(gl) {
        let arrayIndex = [],
            arrayUv = [],
            arrayVertices = [];

        for (let i = 0; i < 100; i++) {
            let size = 0.5,
                half = size * 0.5,
                angle = Math.PI * 2 * Math.random(),
                dx = half * Math.cos(angle),
                dy = half * Math.sin(angle),
                x = -2.5 + (Math.random() * 5),
                y = 0.1,
                z = 2.5 - (Math.random() * 5),
                p = i * 4;

            arrayVertices.push(x - dx, y + half, z - dy);
            arrayVertices.push(x - dx, y - half, z - dy);
            arrayVertices.push(x + dx, y - half, z + dy);
            arrayVertices.push(x + dx, y + half, z + dy);

            arrayUv.push(0, 0, 0, 1, 1, 1, 1, 0);
            arrayIndex.push(p, p + 1, p + 2, p + 2, p + 3, p);
        }

        let mesh = gl.fCreateMeshVAO("MultiQuad", arrayIndex, arrayVertices, null, arrayUv);
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