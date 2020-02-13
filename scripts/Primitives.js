let Primitives = {};
Primitives.GridAxis = class {

    static createMesh(gl) {
        let vertices = [0, 0.5, 0, 0,    0, -0.5, 0, 1]; //xyz colour

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