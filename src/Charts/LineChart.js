import Chart from './Chart.js'

// for charts with numerical y values, and non-numerical x-values (ie. date intervals)

class LineChart extends Chart {
    lines = {}

    constructor(xName, yName){
        this.xName = xName;
        this.yName = yName;
    }

    // takes a sequence from x = 0 to x = n, 
    addLine(name, sequence, color){
        const material = new THREE.LineBasicMaterial({ color })

        const points = [];

        sequence.forEach( (p, i) => {
            points.push( new THREE.Vector3((i/this.domain), p.y, 0 ) );
        })
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );
        this.scene.add(line)

        lines[name] = {
            material,
            points,
            line
        }
    }

    setXLabels(labels){
        const howMany = labels.length
        const space = Math.floor(this.domain/howMany)
        // add labels
    }

    setYLabels(labels){
        // add labels
    }


}

export { LineChart }