// Dimensions of graph
const xSize = 800
const ySize = 544
const margin = {top: 20, right: 30, bottom: 30, left: 40}
const maxWidth = xSize - margin.left - margin.right
const maxHeight = ySize - margin.top - margin.bottom

// Scales for axes
const xScale = d3.scaleLinear().range([0, maxWidth])
const yScale = d3.scaleLinear().range([maxHeight, 0])

// Set up svg container
const svg = d3.select('#container').append('svg')
  .attr('width', xSize)
  .attr('height', ySize)
  .attr('style', 'cursor: crosshair;')
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

// Axes generating
const xAxis = d3.axisBottom(xScale)
const yAxis = d3.axisLeft(yScale)

// Line generator
const line = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y))

// Load data and create graph
let seriesData = []
fetch('data_different_time_stamps.txt')
  .then(res => res.json())
  .then(raw => {
    seriesData = Object.entries(raw).map(([key, points]) => ({
      name: key,
      values: points.map(([x, y]) => ({ x, y }))
    }))

const allXVals = seriesData.flatMap(s => s.values.map(v => v.x))
const allYVals = seriesData.flatMap(s => s.values.map(v => v.y))

xScale.domain(d3.extent(allXVals))
yScale.domain([0, d3.max(allYVals)])

svg.append('g')
    .attr('transform', `translate(0, ${maxHeight})`)
    .attr('class', 'x-axis')
    .call(xAxis)

svg.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)

svg.selectAll('path.series')
    .data(seriesData)
    .join('path')
    .attr('class', 'series')
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('d', d => line(d.values))
})
.catch(err => console.error('Error loading data:', err))

// Creating cursor tracing lines
const cursor_field = document.getElementById('cursor_locator')
const container = document.getElementById('container')

const vertical_line = svg.append('line')
    .attr('stroke', 'gray')
    .attr('stroke-dasharray', 5,5)

const horizontal_line = svg.append('line')
    .attr('stroke', 'gray')
    .attr('stroke-dasharray', 5,5)

function updateMousePos(event) {
    const rect = container.getBoundingClientRect()
    const mouseX = event.clientX - rect.left - margin.left
    const mouseY = event.clientY - rect.top - margin.top
    vertical_line
        .attr('x1', mouseX)
        .attr('y1', 0)
        .attr('x2', mouseX)
        .attr('y2', maxHeight)
    
    horizontal_line
        .attr('x1', 0)
        .attr('y1', mouseY)
        .attr('x2', maxWidth)
        .attr('y2', mouseY)

    // Displaying cursor coordinates
    const xValNormalized = xScale.invert(mouseX)
    const yValNormalized = yScale.invert(mouseY)
    
    cursor_field.innerHTML = 
    `<p>x: ${xValNormalized.toFixed(3)},
    y: ${yValNormalized.toFixed(2)}</p>`

    // Adding dots in places of intersetion
    const intersections = []
    seriesData.forEach(s => {
        const values = s.values
        for(let i = 0; i<values.length - 1; i++){
            const p1 = values[i]
            const p2 = values[i+1]
            if(xValNormalized >= p1.x && xValNormalized <= p2.x){
                const t = (xValNormalized - p1.x) / (p2.x - p1.x)
                const yAtX = p1.y + t * (p2.y - p1.y)
                intersections.push({x: xValNormalized, y: yAtX})
                break
            }
        }
    })
    svg.selectAll('circle.intersection')
        .data(intersections)
        .join('circle')
        .attr('class', 'intersection')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 4)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5)
}

container.addEventListener('mousemove', updateMousePos)
container.addEventListener('scroll', updateMousePos)

// Adding zooming into graph and creating drag selection area
const brush = d3.brush()
    .extent([[0,0], [maxWidth, maxHeight]])
    .on("end", brushed)

svg.append("g")
    .attr("class", "brush")
    .call(brush)

function brushed(event){
    if (!event.selection) return

    const x0 = event.selection[0][0]
    const x1 = event.selection[1][0]
    const y0 = event.selection[0][1]
    const y1 = event.selection[1][1]

    const newXDomain = [xScale.invert(x0), xScale.invert(x1)]
    const newYDomain = [yScale.invert(y1), yScale.invert(y0)]

    xScale.domain(newXDomain)
    yScale.domain(newYDomain)

    svg.select('.x-axis').call(xAxis)
    svg.select('.y-axis').call(yAxis)

    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
    svg.selectAll('.series').attr('d', d => line(d.values))
    svg.select(".brush").call(brush.move, null)
}

// Adding reset button for zoom
const butt = document.getElementById('zoomout_butt')
butt.addEventListener('click', () => {
    const allXVals = seriesData.flatMap(s => s.values.map(v => v.x))
    const allYVals = seriesData.flatMap(s => s.values.map(v => v.y))
    xScale.domain(d3.extent(allXVals))
    yScale.domain([0, d3.max(allYVals)])
    svg.select('.x-axis').call(xAxis)
    svg.select('.y-axis').call(yAxis)
    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
    svg.selectAll('.series').attr('d', d => line(d.values))
})

// Creating legend
const legend = document.getElementById('legend')
fetch('data_different_time_stamps.txt')
  .then(res => res.json())
  .then(raw => {
    seriesData = Object.entries(raw).map(([key, points]) => ({
      name: key,
      values: points.map(([x, y]) => ({ x, y }))
    }))
    seriesData.forEach(s => {
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.style.marginTop = '5px'
        checkbox.checked = true
        legend.appendChild(checkbox)
        const legendName = document.createElement('span')
        legendName.textContent = s.name
        legendName.style.marginTop = '5px'
        legendName.setAttribute('id', `legend-${s.name}`)
        legend.appendChild(legendName)
        legend.appendChild(document.createElement('br'))

        checkbox.addEventListener('change', () => {
            const line = svg.selectAll('.series').filter(d => d.name === s.name)
            if(checkbox.checked){
                line.style('display', null)
                legendName.style.textDecoration = null
            } else {
                line.style('display', 'none')
                legendName.style.textDecoration = 'line-through'
            }
        })
    })
})