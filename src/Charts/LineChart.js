import { Chart } from './Chart.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import * as THREE from 'three'

class LineChart extends Chart {

    // takes a sequence from x = 0 to x = n, 
    addLine(name, sequence, color){

        this.updateRangeFromData(sequence)

        this.properties.push({
            name,
            sequence,
            color
        })

        return this
    }


    build(){
        // build new graph lines
        for (let property of this.properties){
            
            let resY = this.wrapper.offsetHeight/this.wrapper.offsetWidth
            this.resY = resY

            const material = new LineMaterial({ color: property.color, linewidth: 0.0035, resolution: new THREE.Vector2(1, resY), dashed: true, vertexColors: true, dashSize: 0.0035, gapSize: 0.0035 })
            const { points, colors } = this.getVerts(property.sequence, property.color, true)
            material.defines.USE_DASH = ""
            material.needsUpdate = true;
            const geometry = new LineGeometry();
            geometry.setPositions( points );
            geometry.setColors( colors );
            const line = new Line2( geometry, material )
            this.add(line)
        }

        // run any other build steps (adding labels, any custom additions we want to make to the graph or in it's wrapper)
        for (let b of this.buildSteps){
            b()
        }

        // add new axis lines
        if (this.showXLines && this.xLabels){
            this.buildGridLines('x')
        }
        if (this.showYLines && this.yLabels){
            this.buildGridLines('y')
        }

        // register eventlisteners at the end of the build
        for (let e of this.graphEvents){
            this.wrapper.addEventListener(e.what, e.do)
        }

    }


}

export { LineChart }