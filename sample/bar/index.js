import { gsap } from 'gsap'
import * as THREEDATA from '../../src/ThreeData'

export default function drawNewUsers(grapher, dA, dB){
    
    // line chart for engagement
    const newUsers = new THREEDATA.BarChart('Time', 'New Users', grapher.wrapper);

    // data must be transformed into integer plottings, even if not numerical. For example,for the data-based x-axis, since we are plotting by month, we can transform months into their integer form from 1 -> 12
    // let dataA = [{x: '01/01/2022', y: 22}, {x: '02/01/2022', y: 16}, {x: '03/01/2022', y: 32}, {x: '04/01/2022', y: 28}, {x: '05/01/2022', y: 13}, {x: '06/01/2022', y: 24}, {x: '07/01/2022', y: 5}, {x: '08/01/2022', y: 14}, {x: '09/01/2022', y: 32}, {x: '10/01/2022', y: 45}, {x: '11/01/2022', y: 60}, {x: '12/01/2022', y: 34}]
    // let dataB = [{x: '01/01/2022', y: 16}, {x: '02/01/2022', y: 13}, {x: '03/01/2022', y: 34}, {x: '04/01/2022', y: 54}, {x: '05/01/2022', y: 13}, {x: '06/01/2022', y: 23}, {x: '07/01/2022', y: 51}, {x: '08/01/2022', y: 41}, {x: '09/01/2022', y: 23}, {x: '10/01/2022', y: 54}, {x: '11/01/2022', y: 6}, {x: '12/01/2022', y: 44}]
    let dataA = [{x: 1, y: 3}, {x: 2, y: 6}, {x: 3, y: 2}, {x: 4, y: 0}, {x: 5, y: 8}, {x: 6, y: 12}, {x: 7, y: 5}, {x: 8, y: 2}, {x: 9, y: 5}, {x: 10, y: 0}, {x: 11, y: 1}, {x: 12, y: 5}]
    let dataB = [{x: 1, y: 5}, {x: 2, y: 8}, {x: 3, y: 3}, {x: 4, y: 9}, {x: 5, y: 5}, {x: 6, y: 10}, {x: 7, y: 5}, {x: 8, y: 1}, {x: 9, y: 4}, {x: 10, y: 0}, {x: 11, y: 1}, {x: 12, y: 6}]

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""];
    newUsers.showYLines = true

    newUsers
        .addBars("projectA", dataA, '#1374BB')
        .addBars("projectB", dataB, '#25A49C')
        .addAxisNames('label')
        .setYLabels(5, true, 'label') // this should be based on 
        .setXLabels(monthNames, false, 'label')
    
    // manipulate the camera perspective to "animate the graph in"
    let toCameraTop = newUsers.camera.top
    let toCameraBottom = newUsers.camera.bottom

    gsap.set(newUsers.camera, {top: 0, bottom: 0, onComplete: () => {
        newUsers.camera.updateProjectionMatrix()
        gsap.to(newUsers.camera, { top: toCameraTop, bottom: toCameraBottom, ease: 'ease-out', duration: 1, onUpdate: () => {
            grapher.graph(newUsers)
            newUsers.camera.updateProjectionMatrix()
        }})
    }})

    return newUsers;
}