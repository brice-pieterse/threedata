import * as THREE from 'three';

class Chart extends THREE.Scene {
    constructor(wide, tall){
        setAspectRatio(wide, tall);
        this.needsUpdate = true
    }

    setAspectRatio(wide, tall){
        this.domain = 1.0;
        this.range = wide/tall;
        this.needsUpdate = true
    }
}

export { Chart };