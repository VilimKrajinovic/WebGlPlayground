class Camera {

    constructor(gl, fov, near, far) {
        this.projectionMatrix = new Float32Array(16);
        let ratio = gl.canvas.width / gl.canvas.height;
        Matrix4.perspective(this.projectionMatrix, fov || 45, ratio, near || 0.1, far || 100.0);

        this.transform = new Transform();
        this.viewMatrix = new Float32Array(16);

        this.mode = Camera.MODE_ORBIT;
    }

    panX(v) {
        if (this.mode === Camera.MODE_ORBIT) {
            return;
        }

        this.updateViewMatrix();
        this.transform.position.x += this.transform.right[0] * v;
        this.transform.position.y += this.transform.right[1] * v;
        this.transform.position.z += this.transform.right[2] * v;

    }

    panY(v) {
        this.updateViewMatrix();
        this.transform.position.y += this.transform.up[1] * v;
        if (this.mode === Camera.MODE_ORBIT) {
            return;
        }
        this.transform.position.x += this.transform.up[0] * v;
        this.transform.position.z += this.transform.up[2] * v;
    }

    panZ(v) {
        this.updateViewMatrix();
        if (this.mode === Camera.MODE_ORBIT) {
            this.transform.position.z += v;
        } else {
            this.transform.position.x += this.transform.forward[0] * v;
            this.transform.position.y += this.transform.forward[1] * v;
            this.transform.position.z += this.transform.forward[2] * v;
        }
    }

    updateViewMatrix() {
        if (this.mode === Camera.MODE_FREE) {
            this.transform.matrixView.reset()
                .vtranslate(this.transform.position)
                .rotateX(this.transform.rotation.x * Transform.degreeToRadian)
                .rotateY(this.transform.rotation.y * Transform.degreeToRadian);
        } else {
            this.transform.matrixView.reset()
                .rotateX(this.transform.rotation.x * Transform.degreeToRadian)
                .rotateY(this.transform.rotation.y * Transform.degreeToRadian)
                .vtranslate(this.transform.position);
        }

        this.transform.updateDirection();

        Matrix4.invert(this.viewMatrix, this.transform.matrixView.raw);
        return this.viewMatrix;
    }
}

Camera.MODE_FREE = 0;
Camera.MODE_ORBIT = 1;

class CameraController {
    constructor(gl, camera) {
        let otherThis = this;
        let box = gl.canvas.getBoundingClientRect();
        this.canvas = gl.canvas;
        this.camera = camera;

        this.rotateRate = -300;
        this.panRate = 5;
        this.zoomRate = 200;

        this.offsetX = box.left;
        this.offsetY = box.top;

        this.initialX = 0;
        this.initialY = 0;
        this.previousX = 0;
        this.previousY = 0;

        this.onUpHandler = function (e) {
            otherThis.onMouseUp(e);
        };
        this.onMoveHandler = function (e) {
            otherThis.onMouseMove(e);
        };

        this.canvas.addEventListener("mousedown", function (e) {
            otherThis.onMouseDown(e);
        });
        this.canvas.addEventListener("mousewheel", function (e) {
            otherThis.onMouseWheel(e);
        });
    }

    getMouseVec2(e) {
        return {x: e.pageX - this.offsetX, y: e.pageY - this.offsetY};
    }

    onMouseDown(e) {
        this.initialX = this.previousX = e.pageX - this.offsetX;
        this.initialY = this.previousY = e.pageY - this.offsetY;

        this.canvas.addEventListener("mouseup", this.onUpHandler);
        this.canvas.addEventListener("mousemove", this.onMoveHandler);
    }

    onMouseUp(e) {
        this.canvas.removeEventListener("mouseup", this.onUpHandler);
        this.canvas.removeEventListener("mousemove", this.onMoveHandler);
    }

    onMouseWheel(e) {
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        this.camera.panZ(delta * (this.zoomRate / this.canvas.height));
    }

    onMouseMove(e){
        let x = e.pageX -this.offsetX,
            y = e.pageY - this.offsetY,
            dx = x - this.previousX,
            dy = y - this.previousY;

        if(!e.shiftKey){
            this.camera.transform.rotation.y += dx * (this.rotateRate / this.canvas.width);
            this.camera.transform.rotation.x += dy * (this.rotateRate / this.canvas.height);
        }else{
            this.camera.panX(-dx * (this.panRate/this.canvas.width));
            this.camera.panY(dy * (this.panRate/this.canvas.height));
        }
        this.previousX = x;
        this.previousY = y;
    }
}