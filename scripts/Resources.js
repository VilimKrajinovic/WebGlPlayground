class Resources {
    static setup(gl, completeHandler) {
        Resources.gl = gl;
        Resources.onComplete = completeHandler;
        return this;
    }

    static start() {
        if (Resources.Queue.length > 0) {
            Resources.loadNextItem();
        }
    }

    static loadTexture(name, source) {
        for (let i = 0; i < arguments.length; i += 2) {
            Resources.Queue.push({type: "img", name: arguments[i], src: arguments[i + 1]});
        }
        return this;
    }
    static loadVideoTexture(name, src){
        for (let i = 0; i < arguments.length; i+=2) {
            Resources.Queue.push({type: "vid", name: arguments[i], src: arguments[i + 1]});
        }

        return this;
    }

    static loadNextItem() {
        if (Resources.Queue.length === 0) {
            if (Resources.onComplete !== null) Resources.onComplete();
            else console.log("Resource download queue complete");
            return;
        }

        let item = Resources.Queue.pop();
        switch (item.type) {
            case "img":
                let img = new Image();
                img.queueData = item;
                img.onload = Resources.onDownloadSuccess;
                img.onabort = img.onerror = Resources.onDownloadError;
                img.src = item.src;
                break;
            case "vid":
                let vid = document.createElement("video");
                vid.style.display = "none";
                document.body.appendChild(vid);

                vid.queueData = item;
                vid.addEventListener("loadeddata", Resources.onDownloadSuccess, false);
                vid.onabort = vid.onerror = Resources.onDownloadError;
                vid.autoplay = true;
                vid.loop = true;
                vid.src = item.src;
                vid.load();
                vid.muted = true;
                vid.play();
                Resources.Videos[item.name] = vid;
                break;
        }
    }


    static onDownloadSuccess() {
        if (this instanceof Image || this.tagName === "VIDEO") {
            let data = this.queueData;
            Resources.gl.fLoadTexture(data.name, this);
        }
        Resources.loadNextItem();
    }

    static onDownloadError() {
        console.error("Error getting ", this);
        Resources.loadNextItem();
    }
}

Resources.Videos = [];
Resources.Images = [];
Resources.Queue = [];
Resources.onComplete = null;
Resources.gl = null;
