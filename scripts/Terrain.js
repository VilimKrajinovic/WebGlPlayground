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

        let mesh = gl.fCreateMeshVAO("Terrain", arrayIndex, arrayVertex, null, arrayUvs, 3);
        mesh.drawMode = gl.POINTS;
        return mesh;
    }
}