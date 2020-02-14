class Transform {

    constructor() {
        this.position = new Vector3(0, 0, 0);
        this.scale = new Vector3(1, 1, 1);
        this.rotation = new Vector3(0, 0, 0);

        this.matrixView = new Matrix4();
        this.matrixNormal = new Float32Array(9);

        this.forward = new Float32Array(4);
        this.up = new Float32Array(4);
        this.right = new Float32Array(4); // invert to get left
    }

    updateMatrix() {
        this.matrixView.reset()
            .vtranslate(this.position)
            .rotateX(this.rotation.x * Transform.degreeToRadian)
            .rotateZ(this.rotation.z * Transform.degreeToRadian)
            .rotateY(this.rotation.y * Transform.degreeToRadian)
            .vscale(this.scale);

        Matrix4.normalMat3(this.matrixNormal, this.matrixView.raw);

        Matrix4.transformVec4(this.forward, [0, 0, 1, 0], this.matrixView.raw);
        Matrix4.transformVec4(this.up, [0, 1, 0, 0], this.matrixView.raw);
        Matrix4.transformVec4(this.right, [1, 0, 0, 0], this.matrixView.raw);

        return this.matrixView.raw;
    }

    updateDirection() {
        Matrix4.transformVec4(this.forward, [0, 0, 1, 0], this.matrixView.raw);
        Matrix4.transformVec4(this.up, [0, 1, 0, 0], this.matrixView.raw);
        Matrix4.transformVec4(this.right, [1, 0, 0, 0], this.matrixView.raw);
        return this;
    }

    getViewMatrix() {
        return this.matrixView.raw;
    }

    getNormalMatrix() {
        return this.matrixNormal;
    }

    reset() {
        this.position.set(0, 0, 0,);
        this.scale.set(1, 1, 1);
        this.rotation.set(0, 0, 0);

    }
}

Transform.degreeToRadian = Math.PI / 180;
