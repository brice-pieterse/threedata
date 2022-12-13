import * as THREEDATA from '../src/ThreeData'

// include the same renderer settings you would include with a normal threejs renderer
const grapher = new THREEDATA.Grapher();

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// line chart example
const engagement = new THREEDATA.LineChart('Time', 'Avg. Engagement Time (m)', canvas.innerWidth, canvas.innerHeight);

// data must be in sequential order
// we could take the x and transform it into a sequence of integers from 1 to 365 in order
// if y is non-sequencial data, like dates, it should be transformed into integer-values (ie. 1-> 12), but it does not need to be sequential
let projectA = [{x: '01/01/2022', y: 22}, {x: '02/01/2022', y: 16}, {x: '03/01/2022', y: 32}, {x: '04/01/2022', y: 28}, {x: '05/01/2022', y: 13}, {x: '06/01/2022', y: 24}, {x: '07/01/2022', y: 5}, {x: '08/01/2022', y: 14}, {x: '09/01/2022', y: 32}, {x: '10/01/2022', y: 45}, {x: '11/01/2022', y: 60}, {x: '12/01/2022', y: 34}]
let projectB = [{x: '01/01/2022', y: 16}, {x: '02/01/2022', y: 13}, {x: '03/01/2022', y: 34}, {x: '04/01/2022', y: 54}, {x: '05/01/2022', y: 13}, {x: '06/01/2022', y: 23}, {x: '07/01/2022', y: 51}, {x: '08/01/2022', y: 41}, {x: '09/01/2022', y: 23}, {x: '10/01/2022', y: 54}, {x: '11/01/2022', y: 6}, {x: '12/01/2022', y: 44}]

const canvas = document.querySelector('.canvas')

// internally creates x and y ranges
engagement
    .addLine("projectA", projectA, '#1374BB') // adds a line to the graph scene
    .addLine("projectB", projectB, '#25A49C')
    .setXLabels(monthNames)
    .setYLabels([10, 20, 30, 40])
    .onHover((mouseX, mouseY, lines) => {
        const projA = lines["projectA"]
        const projB = lines["projectB"]

        const pointA = projA.getPoint(mouseX) // if no point exists at this x, gets the point prior to this x
        const pointB = projB.getPoint(mouseX)

        const dataA = projA.getData(pointA)
        const dataB = projA.getData(pointB)

        // show a tooltip at the data
    })
    .addGridLines('dotted')
    .addAxisNames()
    .addLegend()

window.addEventListener("resize", () => {
    engagement.setAspectRatio(canvas.innerWidth, canvas.innerHeight)
})
    

// show a chart by rendering the chart to a canvas in the dom once
grapher.graph(engagement, document.querySelector('.chart'))