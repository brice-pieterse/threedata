import { Chart } from "./Chart"
import * as THREE from 'three'

class BarChart extends Chart {

    constructor(xName, yName, wrapper){
        super(xName, yName, wrapper);
        this.dropShadow = false
        this.dropShadowMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec2 vUv; 
                
                void main(){
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;
                    vUv = uv;
                }
            `,
            fragmentShader: `
            varying vec2 vUv; 
                void main(){
                    float intensity = (1.0 - vUv.x) * vUv.x;
                    gl_FragColor = vec4(0.0, 0.0, 0.0, intensity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        })
    }
    // takes a sequence from x = 0 to x = n, 
    addBars(name, sequence, color){
        const material = new THREE.MeshBasicMaterial({ color: color})
        this.updateRangeFromData(sequence)

        this.properties.push({
            name,
            sequence,
            material,
            overlapping: false,
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
                        mesh.position.set(i.x + start + (j * offset), (i.y)/2, 1)
                        this.add(mesh)
                        
                        if (this.dropShadow &&  o == 0){
                            const dropShadow = new THREE.PlaneGeometry(width * 0.9 * 1.5, i.y);
                            const dropMesh = new THREE.Mesh(dropShadow, this.dropShadowMaterial)
                            dropMesh.position.set(i.x + start + (j * offset), (i.y)/2, 0.5)
                            this.add(dropMesh)
                        }

                    }
                    
                }
            }
            else {
                for (let i of property.sequence){
                    const geometry = new THREE.BoxGeometry(width * 0.9, i.y);
                    const mesh = new THREE.Mesh( geometry, property.material )
                    mesh.position.set(i.x + start + (j * offset), (i.y)/2, 1)
                    if (this.dropShadow){
                        
                        const dropShadow = new THREE.PlaneGeometry(width * 0.9 * 1.5, i.y);
                        const dropMesh = new THREE.Mesh(dropShadow, this.dropShadowMaterial)
                        dropMesh.position.set(i.x + start + (j * offset), (i.y)/2, 0.5)
                        this.add(dropMesh)
                    }
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
            this.buildGridLines('x')
        }
        if (this.showYLines){
            this.buildGridLines('y')
        }

        // register eventlisteners at the end of the build
        for (let e of this.graphEvents){
            this.wrapper.addEventListener(e.what, e.do)
        }

    }

}

export { BarChart }