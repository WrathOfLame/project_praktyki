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
    .call(xAxis)

svg.append('g').call(yAxis)

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
    .attr('stroke-width', 1)

const horizontal_line = svg.append('line')
    .attr('stroke', 'gray')
    .attr('stroke-width', 1)

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
            const x1 = values[i]
            const x2 = values[i+1]
            if((xValNormalized >= x1.x && xValNormalized <= x2.x) || (xValNormalized >= x2.x && xValNormalized <= x1.x)){
                const t = (xValNormalized - x1.x) / (x2.x - x1.x)
                const yAtX = x1.y + t * (x2.y - x1.y)
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
        .attr('fill', 'red')
}

container.addEventListener('mousemove', updateMousePos)
container.addEventListener('scroll', updateMousePos)