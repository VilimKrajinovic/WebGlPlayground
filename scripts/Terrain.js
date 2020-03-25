class Terrain {
    static createModel(gl, keepRawData) {
        return new Model(Terrain.createMesh(gl, 10, 10, 20, 20, keepRawData));
    };

    static createMesh(gl, width, height, rowLength, columnLength, keepRawData) {
        let rowStart = width / -2,
            columnStart = height / -2,
            verticesLength = rowLength * columnLength,
            indexLength = (rowLength - 1) * columnLength,
            columnIncrement = width / (columnLength - 1),
            rowIncrement = height / (rowLength - 1),
            currentRow = 0,
            currentColumn = 0,
            arrayVertex = [],
            arrayIndex = [],
            arrayUvs = [],
            uvXIncrement = 1 / (columnLength - 1),
            uvYIncrement = 1 / (rowLength - 1);

        //Perlin nosie
        noise.seed(1);
        let h = 0,
            freq = 13,
            maxHeight = -3;

        for (let i = 0; i < verticesLength; i++) {
            currentRow = Math.floor(i / columnLength);
            currentColumn = i % columnLength;
            h = noise.perlin2((currentRow + 1) / freq, (currentColumn + 1) / freq) * maxHeight;

            //x,y,z
            arrayVertex.push(
                columnStart + currentColumn * columnIncrement,
                0.2 + h,
                rowStart + currentRow * rowIncrement
            );

            arrayUvs.push(
                (currentColumn === columnLength - 1) ? 1 : currentColumn * uvXIncrement,
                (currentRow === rowLength - 1) ? 1 : currentRow * uvYIncrement
            );


            if (i < indexLength) {
                arrayIndex.push(currentRow * columnLength + currentColumn, (currentRow + 1) * columnLength + currentColumn);


                if (currentColumn === columnLength - 1 && i < indexLength - 1) {//end
                    arrayIndex.push((currentRow + 1) * columnLength + currentColumn, (currentRow + 1) * columnLength);//make degenerate triangle
                }

            }

        }

        //..................................
        //Generate the Normals using finite difference method
        let x,					        //X Position in grid
            y,					        //Y Position in grid
            p,					        //Temp Array Index when calculating neighboring vertices
            pos,				        //Using X,Y, determine current vertex index position in array
            xMax = columnLength - 1,		//Max X Position in Grid
            yMax = rowLength - 1,		//Max Y Position in Grid
            normalX = 0,				//Normal X value
            normalY = 0,				//Normal Y value
            normalZ = 0,				//Normal Z value
            normalLength = 0,		    //Normal Vector Length
            heightLeft,					//Left Vector height
            heightRight,				//Right Vector Height
            heightDown,					//Down Vector height
            heightUp,					//Up Vector Height
            arrayNormals = [];			//Normal Vector Array

        for (let i = 0; i < verticesLength; i++) {
            y = Math.floor(i / columnLength);	//Current Row
            x = i % columnLength;				//Current Column
            pos = y * 3 * columnLength + x * 3;		//X,Y position to Array index conversion

            //Get the height value of 4 neighboring vectors: Left,Right,Top Left

            if (x > 0) { //LEFT
                p = y * 3 * columnLength + (x - 1) * 3;	//Calc Neighbor Vector
                heightLeft = arrayVertex[p + 1];		//Grab only the Y position which is the height.
            } else heightLeft = arrayVertex[pos + 1];	//Out of bounds, use current

            if (x < xMax) { //RIGHT
                p = y * 3 * columnLength + (x + 1) * 3;
                heightRight = arrayVertex[p + 1];
            } else heightRight = arrayVertex[pos + 1];

            if (y > 0) { //UP
                p = (y - 1) * 3 * columnLength + x * 3;
                heightUp = arrayVertex[p + 1];
            } else heightUp = arrayVertex[pos + 1];

            if (y < yMax) { //DOWN
                p = (y + 1) * 3 * columnLength + x * 3;
                heightDown = arrayVertex[p + 1];
            } else heightDown = arrayVertex[pos + 1];

            //Calculate the final normal vector
            normalX = heightLeft - heightRight;
            normalY = 2.0;
            normalZ = heightDown - heightUp;
            normalLength = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);	//Length of vector
            arrayNormals.push(normalX / normalLength, normalY / normalLength, normalZ / normalLength);			//Normalize the final normal vector data before saving to array.
        }


        let mesh = gl.fCreateMeshVAO("Terrain", arrayIndex, arrayVertex, arrayNormals, arrayUvs, 3);
        mesh.drawMode = gl.TRIANGLE_STRIP;

        if (keepRawData) {
            mesh.aVert = arrayVertex;
            mesh.aNorm = arrayNormals;
            mesh.aIndex = arrayIndex;
        }

        return mesh;
    }
}
