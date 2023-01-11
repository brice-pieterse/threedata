import * as THREE from 'three';

const cleanMaterial = material => {
    material.dispose()
    // dispose textures
    for (const key of Object.keys(material)) {
        const value = material[key]
        if (value && typeof value === 'object' && 'minFilter' in value) { value.dispose() }
    }
}

class Chart extends THREE.Scene {
    
    constructor(xName, yName, wrapper){
        super();
        this.xName = xName;
        this.yName = yName;
        this.wrapper = wrapper
        this.properties = []
        this.graphableXRange = 1;
        this.graphableYRange = 1;
        this.built = false

        this.camera = new THREE.OrthographicCamera()
        this.camera.near = 0.1
        this.camera.far = 5;
        this.camera.position.z = 2;


        // labels
        this.xLabels = []
        this.yLabels = []
        this.labelLines = []
        this.xGridLines = 1
        this.yGridLines = 1

        this.labels = document.createElement('div')
        this.labels.style.width= '100%'
        this.labels.style.height = '100%'
        this.labels.style.position = 'absolute'
        this.labels.style.cursor = 'pointer'
        this.labels.style.top = 0;
        this.labels.style.left = 0;

        this.add(this.camera)

        // build steps and event listening
        this.graphEvents = []
        this.buildSteps = []

        // extras
        this.AxisXDashedLineMaterial = new THREE.LineDashedMaterial( { dashSize: 0.1, gapSize: 1, color: 0x000000, opacity: 0.25, transparent: true, depthWrite: false, depthTest: true } );
        this.AxisYDashedLineMaterial = new THREE.LineDashedMaterial( { dashSize: 0.1, gapSize: 1, color: 0x000000, opacity: 0.25, transparent: true, depthWrite: false, depthTest: true } );
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();            
    }

    setXLabels(labels, matchNumerically = false, gridLines, ...classes){
        if (Array.isArray(labels)){
            // always true
            if (labels.length > this.graphableXRange){
                this.setGraphableXRange(labels.length)
            }
            else if (matchNumerically && labels[labels.length -1] > this.graphableXRange){
                this.graphableXRange = labels[labels.length -1]
            }

            this.buildSteps.push(() => {
                let g = 0;
                for (let i = 0; i < labels.length; i++){
                    g++
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = labels[i]
                    label.style.position = 'absolute'
                    label.style.whiteSpace = 'nowrap'
                    label.style.bottom = 0;
        
                    if (!matchNumerically){
                        percentFromOrigin = ((i + 1)/labels.length) * 100
                        label.style.left = `${percentFromOrigin}%`
                    }
                    else {
                        percentFromOrigin = (labels[i]/this.graphableXRange) * 100
                        label.style.left = `${percentFromOrigin}%`
                    }
        
                    this.labels.appendChild(label)
                    this.xLabels.push({
                        percentFromOrigin, label
                    })
                    
                    for (let c of classes){
                        label.classList.add(c)
                    }
        
                    label.style.transform = `translate(-50%, 16px)`
                }

                if (gridLines){
                    this.setXGridLines(g + 1)
                }
            })
        }
        // we are using increments
        else if (!Number.isNaN(labels)) {

            let increment = labels
            if (increment == 0){
                increment = 1
            }

            if (labels > this.graphableXRange){
                this.setGraphableXRange(labels)
            }
            else if (labels > 0){
                this.setGraphableXRange(Math.ceil(this.graphableXRange / labels) * labels)
            } 
            // else this.setGraphableXRange(1)

            this.buildSteps.push(() => {
                let incr = 0;
                let i = 1;
                
                while(incr < this.graphableXRange){
                    incr = i * increment;
                    i++
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = incr
                    label.style.position = 'absolute'
                    label.style.left = 0
                    label.style.whiteSpace = 'nowrap'
                    percentFromOrigin = (incr/this.graphableXRange) * 100
                    label.style.bottom = `${percentFromOrigin}%`;
        
                    this.labels.appendChild(label)
    
                    this.yLabels.push({
                        label, percentFromOrigin
                    })
        
                    for (let c of classes){
                        label.classList.add(c)
                    }
        
                    label.style.transform = `translate(-16px, 50%)`
                }

                if (gridLines){
                    this.setXGridLines(i)
                }

            })
        }

        return this
    }
    
    setYLabels(labels, matchNumerically = false, gridLines, ...classes){

        // we are using array matching
        if (Array.isArray(labels)){

            // always true
            if (labels.length > this.graphableYRange){
                this.setGraphableYRange(labels.length)
            }
            else if (matchNumerically && labels[labels.length - 1] > this.graphableYRange){
                this.graphableYRange = labels[labels.length - 1]
            }
    
            this.buildSteps.push(() => {
                let g = 0;
                for (let i = 0; i < labels.length; i++){
                    g++
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = labels[i]
                    label.style.position = 'absolute'
                    label.style.left = 0
                    label.style.whiteSpace = 'nowrap'
        
                    if (!matchNumerically){
                        percentFromOrigin = ((i + 1)/labels.length) * 100
                        label.style.bottom = `${percentFromOrigin}%`;
                    }
                    else {
                        percentFromOrigin = (labels[i]/this.graphableYRange) * 100
                        label.style.bottom = `${percentFromOrigin}%`;
                    }
        
                    this.labels.appendChild(label)
    
                    this.yLabels.push({
                        label, percentFromOrigin
                    })
        
                    for (let c of classes){
                        label.classList.add(c)
                    }
        
                    label.style.transform = `translate(-16px, 50%)`
                }

                if (gridLines){
                    this.setYGridLines(g)
                }

            })
        }
        // we are using increments
        else if (!Number.isNaN(labels)) {

            let increment = labels
            if (increment == 0){
                increment = 1
            }

            if (labels > this.graphableYRange){
                this.setGraphableYRange(labels)
            }
            else if (labels > 0) {
                this.setGraphableYRange(Math.ceil( (this.graphableYRange + increment) / labels) * labels)
            }

            this.buildSteps.push(() => {
                let incr = 0;
                let i = 0;
                while(incr < (this.graphableYRange)){
                    incr = i * increment;
                    i++
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = incr
                    label.style.position = 'absolute'
                    label.style.left = 0
                    label.style.whiteSpace = 'nowrap'
                    percentFromOrigin = (incr/this.graphableYRange) * 100
                    label.style.bottom = `${percentFromOrigin}%`;
                    this.labels.appendChild(label)
    
                    this.yLabels.push({
                        label, percentFromOrigin
                    })
        
                    for (let c of classes){
                        label.classList.add(c)
                    }
        
                    label.style.transform = `translate(-16px, 50%)`
                }

                if (gridLines){
                    this.setYGridLines(i)
                }

            })
        }

        return this;
    }

    setXGridLines(n){
        this.xGridLines = n
        return this;
    }

    setYGridLines(n){
        this.yGridLines = n
        return this;
    }

    buildGridLines(axis){
        switch(axis){
            case 'x':
                for (let i = 0; i < this.xGridLines; i++){
                    let ratio = (this.graphableXRange/this.xGridLines)
                    this.drawLabelLine({x: i * ratio, y: 0}, {x: i * ratio, y: this.graphableYRange}, this.AxisXDashedLineMaterial)
                }
                break
            case 'y':
                if (this.yGridLines > 1){
                    for (let i = 0; i < this.yGridLines; i++){
                        let ratio = (this.graphableYRange/(this.yGridLines - 1))
                        this.drawLabelLine({x: 0, y: i * ratio}, {x: this.graphableXRange, y: i * ratio}, this.AxisYDashedLineMaterial)
                    }
                    break
                }
        }

        return this 
    }

    removeXLabels(){
        // TODO
    }

    removeYLabels(){
        // TODO
    }

    showAxisLines(){
        // TODO
    }

    hideAxisLines(){
        // TODO
    }

    updateRangeFromData(sequence){
        sequence.forEach( (p, i) => {

            if (p.x > this.graphableXRange){
                this.setGraphableXRange(p.x)
            }
            if (p.y > this.graphableYRange){
                this.setGraphableYRange(p.y)
            }
        })
    }

    setGraphableXRange(range){
        this.graphableXRange = range
        this.updateProportions()
    }

    setGraphableYRange(range){
        this.graphableYRange = range
        this.updateProportions()
    }

    drawLabelLine(start, end, mat){
        const { points } = this.getVerts([{x: start.x, y: start.y, z: -1}, {x: end.x, y: end.y, z: -1}], 0x000000)
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
        const line = new THREE.Line( geometry, mat );
        line.computeLineDistances()

        this.add(line)
        line.position.z = -1
        this.labelLines.push(line)
    }

    getVerts(sequence, clr, offset = false){
        const color = new THREE.Color(clr);
        let lineOffset = offset ? (this.graphableYRange * 0.005) : 0  // slight shift up

        const colors = []
        const points = [];

        sequence.forEach( (p, i) => {
            points.push( p.x, p.y + lineOffset, p.z != undefined ? p.z : 0 );
            colors.push(color.r, color.g, color.b)

            if (p.x > this.graphableXRange){
                this.setGraphableXRange(p.x)
            }
            if (p.y > this.graphableYRange){
                this.setGraphableYRange(p.y)
            }
        })

        return { points, colors };
    }

    updateProportions(){
        let resY = this.wrapper.offsetHeight/this.wrapper.offsetWidth
        let resX = this.wrapper.offsetWidth/this.wrapper.offsetHeight
        this.resY = resY
        this.resX = resX

        let lineThicknessX = 0.0025
        let lineThicknessY = 0.0025

        lineThicknessX *= this.graphableYRange
        lineThicknessY *= this.graphableXRange

        this.AxisXDashedLineMaterial.dashSize = lineThicknessX
        this.AxisXDashedLineMaterial.gapSize = lineThicknessX
        this.AxisYDashedLineMaterial.dashSize = lineThicknessY
        this.AxisYDashedLineMaterial.gapSize = lineThicknessY

        const domain = this.graphableXRange;
        const range = this.graphableYRange;
        this.camera.left = -domain/2 // tiny padding for the camera view space;
        this.camera.right = domain/2
        this.camera.top = range/2// tiny padding for the camera view space;
        this.camera.bottom = -range/2
        this.camera.position.x = domain/2;
        this.camera.position.y = range/2;
        this.camera.updateProjectionMatrix();
    }

    addAxisNames(...classes){
        let labelX = document.createElement('p')
        let labelY = document.createElement('p')
        labelX.innerText = this.xName
        labelY.innerText = this.yName
        labelX.style.position = 'absolute'
        labelY.style.position = 'absolute'
        labelX.style.textTransform = 'uppercase'
        labelY.style.textTransform = 'uppercase'

        labelY.style.bottom = `50%`;
        labelY.style.left = '-48px'

        labelX.style.bottom = 0;
        labelX.style.left = `50%`;

        this.labels.appendChild(labelX)
        this.labels.appendChild(labelY)

        for (let c of classes){
            labelX.classList.add(c)
            labelY.classList.add(c)
        }

        labelY.style.transform = `translate(-50%, -50%) rotate(-90deg)`
        labelX.style.transform = `translate(-50%, 40px)`

        return this
    }

    onHover(cb){
        const wrapperHover = (e) => {
            let bounds = this.wrapper.getBoundingClientRect();
            let offsetSetX = e.clientX - bounds.left
            let offsetSetY = e.clientY - bounds.top
            this.pointer.x = (offsetSetX/this.wrapper.offsetWidth) * 2 - 1
            this.pointer.y = -(offsetSetY/this.wrapper.offsetHeight) * 2 + 1
            this.raycaster.setFromCamera( this.pointer, this.camera );
            const cursorInWorldSpace = this.raycaster.ray
            cb(cursorInWorldSpace)
        }

        this.graphEvents.push({what: 'mousemove', do: wrapperHover})
        return this
    }

    onHoverOut(cb){
        this.graphEvents.push({what: 'mouseleave', do: cb})
    }

    onMouseDown(cb){
        const wrapperClick = (e) => {
            let bounds = this.wrapper.getBoundingClientRect();
            let offsetSetX = e.clientX - bounds.left
            let offsetSetY = e.clientY - bounds.top
            this.pointer.x = (offsetSetX/this.wrapper.offsetWidth) * 2 - 1
            this.pointer.y = -(offsetSetY/this.wrapper.offsetHeight) * 2 + 1
            this.raycaster.setFromCamera( this.pointer, this.camera );
            const cursorInWorldSpace = this.raycaster.ray
            cb(cursorInWorldSpace)
        }

        this.graphEvents.push({what: 'mousedown', do: wrapperClick})
        return this
    }

    onMouseUp(cb){
        const wrapperClickRelease = (e) => {
            let bounds = this.wrapper.getBoundingClientRect();
            let offsetSetX = e.clientX - bounds.left
            let offsetSetY = e.clientY - bounds.top
            this.pointer.x = (offsetSetX/this.wrapper.offsetWidth) * 2 - 1
            this.pointer.y = -(offsetSetY/this.wrapper.offsetHeight) * 2 + 1
            this.raycaster.setFromCamera( this.pointer, this.camera );
            const cursorInWorldSpace = this.raycaster.ray
            cb(cursorInWorldSpace)
        }

        this.graphEvents.push({what: 'mouseup', do: wrapperClickRelease})
        return this
    }

    addBeforeGraphing(cb){
        this.buildSteps.push(cb)
        return this
    }

    destroy(){
        // eventlisteners
        for (let e of this.graphEvents){
            this.wrapper.removeEventListener(e.what, e.do)
        }

        // geometries and materials
        this.traverse(object => {
            if (!object.isMesh) return
            object.geometry.dispose()

            if (object.material.isMaterial) {
                cleanMaterial(object.material)
            } else {
                // an array of materials
                for (const material of object.material) cleanMaterial(material)
            }
        })

    }

}

export { Chart };