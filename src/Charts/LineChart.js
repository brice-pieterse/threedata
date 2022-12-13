import { Chart } from './Chart.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'

class LineChart extends Chart {

    // takes a sequence from x = 0 to x = n, 
    addLine(name, sequence, color){
        const material = new LineMaterial({ color, linewidth: 0.005, dashed: false, vertexColors: true })

        this.updateRangeFromData(sequence)

        this.properties.push({
            name,
            sequence,
            material,
            color
        })

        return this
    }


    build(){
        // build new graph lines
        for (let property of this.properties){
            const { points, colors } = this.getVerts(property.sequence, property.color)
            const geometry = new LineGeometry();
            geometry.setPositions( points );
            geometry.setColors( colors );
            const line = new Line2( geometry, property.material )
            this.add(line)
        }

        // run any other build steps (adding labels, any custom additions we want to make to the graph or in it's wrapper)
        for (let b of this.buildSteps){
            b()
        }

        // add new axis lines
        if (this.showXLines){
            this.addLabelLines('x')
        }
        if (this.showYLines){
            this.addLabelLines('y')
        }

        // register eventlisteners at the end of the build
        for (let e of this.graphEvents){
            this.wrapper.addEventListener(e.what, e.do)
        }

    }


}

export { LineChart }