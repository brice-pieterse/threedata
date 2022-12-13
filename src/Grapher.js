import * as THREE from 'three';

class Grapher {

    constructor(wrapper, canvas){
        
        const graphRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, transparent: true })
        graphRenderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
        graphRenderer.setClearColor(0x000000, 0)
        graphRenderer.setPixelRatio(devicePixelRatio)
        this.graphRenderer = graphRenderer;
        
        this.wrapper = wrapper
        this.labelsWrapper = document.createElement('div')
        this.labelsWrapper.style.width= '100%'
        this.labelsWrapper.style.height = '100%'
        this.labelsWrapper.style.position = 'absolute'
        this.labelsWrapper.style.top = 0;
        this.labelsWrapper.style.left = 0;
        this.wrapper.appendChild( this.labelsWrapper )
        this.canvas - canvas
    }

    graph(graph){

        if (!graph.built){
            // remove labels from past graph
            for (let child of this.labelsWrapper.children){
                this.labelsWrapper.removeChild(child)
            }
            // add this graph's labels
            this.labelsWrapper.appendChild(graph.labels)

            // must build the graph components (axis lines and data lines) here since it ensures we have the ranges creates
            graph.build()
            graph.built = true
        }

        this.graphRenderer.render(graph, graph.camera);
    }
}


export { Grapher };