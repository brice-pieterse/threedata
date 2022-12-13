import * as THREE from 'three';

class Grapher {

    constructor(){
        this.renderer = new THREE.WebGLRenderer()
        this.camera = new THREE.OrthographicCamera()
        this.camera.near = 0.1
        this.camera.far = 1;
    }

    graph(graph, canvas){
        if (graph.needsUpdate){
            const domain = graph.domain;
            const range = graph.range;
            this.camera.left = -domain/2;
            this.camera.right = domain/2;
            this.camera.top = range/2;
            this.camera.bottom = -range/2;

            this.camera.position.x = domain/2;
            this.camera.position.y = range/2;
            
            this.camera.updateProjectionMatrix();
            graph.needsUpdate = false
        }

        // set the render target to the canvas

        this.renderer.render(graph, this.camera);
    }
}


export { Grapher };