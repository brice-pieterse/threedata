import { gsap } from 'gsap'
import * as THREEDATA from '../../src/ThreeData'

export default function drawEngagement(grapher, dA, dB){

    // line chart for engagement
    const engagement = new THREEDATA.LineChart('Time', 'Average Engagement (Minutes)', grapher.wrapper);

    // data must be transformed into integer plottings, even if not numerical. For example,for the data-based x-axis, since we are plotting by month, we can transform months into their integer form from 1 -> 12
    // let dataA = [{x: '01/01/2022', y: 22}, {x: '02/01/2022', y: 16}, {x: '03/01/2022', y: 32}, {x: '04/01/2022', y: 28}, {x: '05/01/2022', y: 13}, {x: '06/01/2022', y: 24}, {x: '07/01/2022', y: 5}, {x: '08/01/2022', y: 14}, {x: '09/01/2022', y: 32}, {x: '10/01/2022', y: 45}, {x: '11/01/2022', y: 60}, {x: '12/01/2022', y: 34}]
    // let dataB = [{x: '01/01/2022', y: 16}, {x: '02/01/2022', y: 13}, {x: '03/01/2022', y: 34}, {x: '04/01/2022', y: 54}, {x: '05/01/2022', y: 13}, {x: '06/01/2022', y: 23}, {x: '07/01/2022', y: 51}, {x: '08/01/2022', y: 41}, {x: '09/01/2022', y: 23}, {x: '10/01/2022', y: 54}, {x: '11/01/2022', y: 6}, {x: '12/01/2022', y: 44}]
    let dataA = [{x: 1, y: 13}, {x: 2, y: 16}, {x: 3, y: 22}, {x: 4, y: 19}, {x: 5, y: 13}, {x: 6, y: 24}, {x: 7, y: 5}, {x: 8, y: 14}, {x: 9, y: 27}, {x: 10, y: 16}, {x: 11, y: 23}, {x: 12, y: 12}]
    let dataB = [{x: 1, y: 16}, {x: 2, y: 8}, {x: 3, y: 13}, {x: 4, y: 17}, {x: 5, y: 13}, {x: 6, y: 23}, {x: 7, y: 27}, {x: 8, y: 19}, {x: 9, y: 23}, {x: 10, y: 23}, {x: 11, y: 6}, {x: 12, y: 21}]

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""];

    engagement.showXLines = true
    engagement.showYLines = true

    let verticesA = []
    let verticesB = []
    let vertANearMouse = null
    let vertBNearMouse = null

    engagement
        .addLine("projectA", dataA, '#1374BB')
        .addLine("projectB", dataB, '#25A49C')
        .addAxisNames('label')
        .setYLabels([10, 20, 30, 40], true, 'label')
        .setXLabels(monthNames, false, 'label')
        // we can do things like add css to graph, or setup threejs content
        .addBeforeGraphing(() => {

            // creates our hover regions
            for (let i = 0; i < engagement.graphableXRange; i++){
                let hoverRegion = document.createElement('div')
                hoverRegion.classList.add('graphHoverRegion')
                hoverRegion.style.width = `${(1/engagement.graphableXRange) * 100}%`
                hoverRegion.style.left = `${(i/engagement.graphableXRange) * 100}%`
                engagement.labels.appendChild(hoverRegion)
            }

            // creates our vertice circles
            for (let i = 0; i < dataA.length; i++){
                let vertA = document.createElement('div')
                vertA.style.backgroundColor = '#1374BB'
                vertA.style.left = `${(dataA[i].x/engagement.graphableXRange) * 100}%`
                vertA.style.bottom = `${(dataA[i].y/engagement.graphableYRange) * 100}%`
                vertA.style.transform = `translate(-50%, 50%)`
                verticesA.push(vertA)
                
                let vertB = document.createElement('div')
                vertB.style.backgroundColor = '#25A49C'
                vertB.style.left = `${(dataB[i].x/engagement.graphableXRange) * 100}%`
                vertB.style.bottom = `${(dataB[i].y/engagement.graphableYRange) * 100}%`
                vertB.style.transform = `translate(-50%, 50%)`
                verticesB.push(vertB)

                vertA.classList.add('graphVertCircle')
                vertB.classList.add('graphVertCircle')

                engagement.labels.appendChild(vertA)
                engagement.labels.appendChild(vertB)
            }

        })
        .onHover((data) => {
            // show a circle at the vertices when you hover near it
            let whichA;
            let whichB;

            let cursorOnGraph = data.origin
            
            let x = Math.abs(cursorOnGraph.x) // sometimes we get -0.01 or some small negative when it's 0
            // we are close to a vertice along the x-axis, show tooltip
            if (Math.floor(x + 0.25) > Math.floor(x)){
                let vertX = Math.floor(x + 0.25)
                
                whichA = verticesA[vertX - 1]
                whichB = verticesB[vertX - 1]
            }
            else if (Math.ceil(x - 0.25) < Math.ceil(x)){
                let vertX = Math.ceil(x - 0.25)
                whichA = verticesA[vertX - 1]
                whichB = verticesB[vertX - 1]
            }

            if (whichA){
                whichA.classList.add('hover')
            }

            if (whichB){
                whichB.classList.add('hover')
            }

            if (whichA != vertANearMouse && vertANearMouse != null){
                vertANearMouse.classList.remove('hover')
            }
            
            if (whichB != vertBNearMouse && vertBNearMouse != null){
                vertBNearMouse.classList.remove('hover')
            }

            vertANearMouse = whichA
            vertBNearMouse = whichB

        })


    // manipulate the camera perspective to "animate the graph in"
    let toCameraTop = engagement.camera.top
    let toCameraBottom = engagement.camera.bottom

    gsap.set(engagement.camera, {top: toCameraBottom/10, bottom: toCameraTop/10, onComplete: () => {
        engagement.camera.updateProjectionMatrix()
        gsap.to(engagement.camera, { top: toCameraTop, bottom: toCameraBottom, ease: 'ease-out', duration: 1, onUpdate: () => {
            grapher.graph(engagement)
            engagement.camera.updateProjectionMatrix()
        }})
    }})

    return engagement;
}