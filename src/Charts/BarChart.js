import { Chart } from "./Chart"
import * as THREE from 'three'

class BarChart extends Chart {
    // takes a sequence from x = 0 to x = n, 
    addBars(name, sequence, color){
        const material = new THREE.MeshBasicMaterial({ color: color})
        this.updateRangeFromData(sequence)

        this.properties.push({
            name,
            sequence,
            material,
        })

        return this
    }

    // separate bars that appear at the same position, color may overlap to indicate portions of the bar
    addOverlapBars(name, sequences, colors){
        let materials = []

        for (let i = 0; i < sequences.length; i++){
            materials.push(new THREE.MeshBasicMaterial({ color: colors[i]}))
            this.updateRangeFromData(sequences[i])
        }

        this.properties.push({
            name,
            sequences,
            materials,
            overlapping: true,
        })

        return this
    }


    build(){
        // build new graph bars
        this.properties.forEach((property, j) => {
            
            const variable = (this.properties.length + 2) // width allowing for atleast two bars of space
            const width = 1/variable
            const offset = 1/variable
            const start = -(Math.floor(variable/2) * offset)/2

            if (property.overlapping){
                for (let o = 0; o < property.sequences.length; o++){
                    let oSequence = property.sequences[o]
                    for (let i of oSequence){
                        const geometry = new THREE.BoxGeometry(width * 0.9, i.y);
                        const mesh = new THREE.Mesh( geometry, property.materials[o] )
                        
                        mesh.position.set(i.x + start + (j * offset), (i.y)/2, 0)
                        this.add(mesh)
                    }
                }
            }

            else {
                for (let i of property.sequence){
                    const geometry = new THREE.BoxGeometry(width * 0.9, i.y);
                    const mesh = new THREE.Mesh( geometry, property.material )
                    
                    mesh.position.set(i.x + start + (j * offset), (i.y)/2, 0)
                    this.add(mesh)
                }
            }

        })
        

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

export { BarChart }