// dimensions
const xSize = 800
const ySize = 544
const margin = {top: 20, right: 30, bottom: 30, left: 40}

const container = document.getElementById("container")
const counterBlock = document.getElementById("counter")
container.style.width = xSize+"px"
container.style.height = ySize+"px"

// creating chart
let chart = echarts.init(container, null, {
    renderer: 'canvas',
    useDirtyRect: false
})

// loading data
let graph_coordinates = {}
async function loadData(databasePath){
    const res = await fetch(databasePath)
    const raw = await res.json()

    graph_coordinates = Object.entries(raw).map(([key, points]) => ({
        name: key,
        values: points.map(([x, y]) => ({x, y})) 
    }))
    return graph_coordinates
}

// rendering chart and adding whole functionality
const rect = container.getBoundingClientRect()
loadData("data_different_time_stamps.txt")
    .then(data => createGraph(data))

window.addEventListener('resize', chart.resize)


// Adding zooming out when user double clicks
chart.getZr().on("dblclick", () => {
    chart.dispatchAction({
        type: "dataZoom",
        start: 0,
        end: 100
    })
})

// Grapg creation
function createGraph(graph_coordinates){
    const seriesData = graph_coordinates.map(s => ({
        name: s.name,
        type: 'line',
        data: s.values.map(v => [v.x, v.y])
    }))
    chart.setOption({
        xAxis: {type: 'value'},
        yAxis: {type: 'value'},
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                let text = ''
                // for x values
                const x = params[0].axisValue
                text += `x: ${x.toFixed(3)} <br>`
                //for y values
                params.forEach(p => {
                    const y = p.data[1]
                    text+= `${p.seriesName}: ${y.toFixed(2)}<br>`
                });
                return text
            },
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            show: true,
            orient: 'vertical',
            right: 10,
            top: 'center'
        },
        series: seriesData.map(s => ({
            ...s,
            symbol: "circle",
            itemStyle:{
                color: 'auto'
            },
            emphasis: {
                itemStyle: {
                    color: 'transparent',
                    borderColor: 'auto',
                    borderWidth: 2,
                    scale: false
                }
            }
        })),
        dataZoom: [
            {type: 'inside'},
            {type: 'slider'}
        ]
    })
    return seriesData
}
