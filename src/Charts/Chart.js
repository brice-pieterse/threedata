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

        this.labels = document.createElement('div')
        this.labels.style.width= '100%'
        this.labels.style.height = '100%'
        this.labels.style.position = 'absolute'
        this.labels.style.top = 0;
        this.labels.style.left = 0;

        this.add(this.camera)

        // build steps and event listening
        this.graphEvents = []
        this.buildSteps = []

        // extras
        this.AxisXDashedLineMaterial = new THREE.LineDashedMaterial( { linewidth: 1, scale: 1, dashSize: 0.1, gapSize: 1, color: 0x000000, opacity: 0.25, transparent: true } );
        this.AxisYDashedLineMaterial = new THREE.LineDashedMaterial( { linewidth: 1, scale: 1, dashSize: 0.1, gapSize: 1, color: 0x000000, opacity: 0.25, transparent: true } );
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();            
    }

    // if you provide strings, they will be spaced evenly, this is used for labels like dates if we know the data range will be 12
    // if we chose to match numerically, we must provide array of numbers instead of strings
    setXLabels(labels, matchNumerically = false, ...classes){
        if (Array.isArray(labels)){
            // always true
            if (labels.length > this.graphableXRange){
                this.setGraphableXRange(labels.length)
            }
            else if (matchNumerically && labels[labels.length -1] > this.graphableXRange){
                this.graphableXRange = labels[labels.length -1]
            }

            this.buildSteps.push(() => {
                for (let i = 0; i <  labels.length; i++){
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = labels[i]
                    label.style.position = 'absolute'
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
            })
        }
        // we are using increments
        else if (!Number.isNaN(labels)) {

            if (labels > this.graphableXRange){
                this.setGraphableXRange(labels)
            }
            else {
                this.setGraphablexRange(Math.ceil(this.graphableXRange / labels) * labels)
            }

            this.buildSteps.push(() => {
                let incr = 0;
                let i = 1;
                while(incr < this.graphableXRange){
                    incr = i * labels;
                    i++
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = incr
                    label.style.position = 'absolute'
                    label.style.left = 0
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

            })
        }

        return this
    }
    

    // if you provide an array, labels will be spaced evenly, this is used for labels like dates if we know the data range will be 12
    // if you chose to match numerically, we must provide array of numbers instead of strings, this only works when arr is an array
    // if you provide a numerical value for labels, we will create labels in increments of (labels)
    setYLabels(labels, matchNumerically = false, ...classes){

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
                console.log(this.graphableYRange)
                for (let i = 0; i <  labels.length; i++){
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = labels[i]
                    label.style.position = 'absolute'
                    label.style.left = 0
        
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
            })
        }
        // we are using increments
        else if (!Number.isNaN(labels)) {

            if (labels > this.graphableYRange){
                this.setGraphableYRange(labels)
            }
            else {
                this.setGraphableYRange(Math.ceil(this.graphableYRange / labels) * labels)
            }

            this.buildSteps.push(() => {
                let incr = 0;
                let i = 1;
                while(incr < this.graphableYRange){
                    incr = i * labels;
                    i++
                    let label = document.createElement('p')
                    let percentFromOrigin;
                    label.innerText = incr
                    label.style.position = 'absolute'
                    label.style.left = 0
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

            })
        }

        return this;
    }


    addLabelLines(axis){
        switch(axis){
            case 'x':
                for (let i = 0; i < this.xLabels.length + 1; i++){
                    let ratio = (this.graphableXRange/this.xLabels.length)
                    this.drawLabelLine({x: i * ratio, y: 0}, {x: i * ratio, y: this.graphableYRange}, this.AxisXDashedLineMaterial)
                }
                break
            case 'y':
                for (let i = 0; i < this.yLabels.length + 1; i++){
                    let ratio = (this.graphableYRange/this.yLabels.length)
                    this.drawLabelLine({x: 0, y: i * ratio}, {x: this.graphableXRange, y: i * ratio}, this.AxisYDashedLineMaterial)
                }
                break
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
        if (this.graphableXRange > this.graphableYRange){
            this.aspectXRange = this.graphableXRange/this.graphableYRange
            this.aspectYRange = 1
        }
        else {
            this.aspectXRange = 1
            this.aspectYRange = this.graphableYRange/this.graphableXRange
        }

        this.updateProportions()
    }

    setGraphableYRange(range){
        this.graphableYRange = range

        if (this.graphableYRange > this.graphableXRange){
            this.aspectYRange = this.graphableYRange/this.graphableXRange
            this.aspectXRange = 1
        }
        else {
            this.aspectYRange = 1
            this.aspectXRange = this.graphableXRange/this.graphableYRange
        }

        this.updateProportions()
    }

    drawLabelLine(start, end, mat){
        const { points, colors } = this.getVerts([{x: start.x, y: start.y}, {x: end.x, y: end.y}], 0x000000)
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
        const line = new THREE.Line( geometry, mat );
        line.computeLineDistances()
        this.add(line)
        this.labelLines.push(line)
    }

    getVerts(sequence, clr){
        const color = new THREE.Color(clr);

        const colors = []
        const points = [];

        sequence.forEach( (p, i) => {
            points.push( p.x, p.y, 0 );
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
        this.AxisXDashedLineMaterial.dashSize = this.aspectYRange * (this.aspectYRange * 0.025)
        this.AxisXDashedLineMaterial.gapSize = this.aspectYRange * (this.aspectYRange * 0.025)
        this.AxisYDashedLineMaterial.dashSize = this.aspectXRange * (this.aspectXRange * 0.025)
        this.AxisYDashedLineMaterial.gapSize = this.aspectXRange * (this.aspectXRange * 0.025)

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

        labelY.style.bottom = `50%`;
        labelY.style.left = '-40px'

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

        let bounds = this.wrapper.getBoundingClientRect();

        const wrapperHover = (e) => {
            let offsetSetX = e.clientX - bounds.left
            let offsetSetY = e.clientY - bounds.top
            this.pointer.x = (offsetSetX/this.wrapper.offsetWidth) * 2 - 1
            this.pointer.y = -(offsetSetY/this.wrapper.offsetHeight) * 2 + 1

            this.raycaster.setFromCamera( this.pointer, this.camera );
            const cursorInWorldSpace = this.raycaster.ray
            // console.log(this.pointer.x, this.pointer.y)
            cb(cursorInWorldSpace)
        }

        this.graphEvents.push({what: 'mousemove', do: wrapperHover})

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
            
            //console.log('dispose geometry!')
            object.geometry.dispose()

            if (object.material.isMaterial) {
                cleanMaterial(object.material)
            } else {
                // an array of materials
                for (const material of object.material) cleanMaterial(material)
            }
        })

        console.log("done destorying")

    }

}

export { Chart };