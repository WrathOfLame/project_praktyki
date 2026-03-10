//Dimensions of graph
const xSize = 1200
const ySize = 500
const margin = {top: 20, right: 30, bottom: 30, left: 40}
const maxWidth = xSize - margin.left - margin.right
const maxHeight = ySize - margin.top - margin.bottom

// Create an array with 40 objects having 'value' and 'date' parameters
const data = [
  { date: new Date('2021-01-01'), value: 123 },
  { date: new Date('2021-02-01'), value: 456 },
  { date: new Date('2021-03-01'), value: 789 },
  { date: new Date('2021-04-01'), value: 234 },
  { date: new Date('2021-05-01'), value: 567 },
  { date: new Date('2021-06-01'), value: 890 },
  { date: new Date('2021-07-01'), value: 345 },
  { date: new Date('2021-08-01'), value: 678 },
  { date: new Date('2021-09-01'), value: 901 },
  { date: new Date('2021-10-01'), value: 112 },
  { date: new Date('2021-11-01'), value: 334 },
  { date: new Date('2021-12-01'), value: 556 },
  { date: new Date('2022-01-01'), value: 778 },
  { date: new Date('2022-02-01'), value: 990 },
  { date: new Date('2022-03-01'), value: 211 },
  { date: new Date('2022-04-01'), value: 433 },
  { date: new Date('2022-05-01'), value: 655 },
  { date: new Date('2022-06-01'), value: 877 },
  { date: new Date('2022-07-01'), value: 199 },
  { date: new Date('2022-08-01'), value: 311 },
  { date: new Date('2022-09-01'), value: 533 },
  { date: new Date('2022-10-01'), value: 755 },
  { date: new Date('2022-11-01'), value: 977 },
  { date: new Date('2022-12-01'), value: 188 },
  { date: new Date('2023-01-01'), value: 422 },
  { date: new Date('2023-02-01'), value: 644 },
  { date: new Date('2023-03-01'), value: 866 },
  { date: new Date('2023-04-01'), value: 288 },
  { date: new Date('2023-05-01'), value: 511 },
  { date: new Date('2023-06-01'), value: 733 },
  { date: new Date('2023-07-01'), value: 955 },
  { date: new Date('2023-08-01'), value: 377 },
  { date: new Date('2023-09-01'), value: 599 },
  { date: new Date('2023-10-01'), value: 821 },
  { date: new Date('2023-11-01'), value: 143 },
  { date: new Date('2023-12-01'), value: 365 },
  { date: new Date('2024-01-01'), value: 587 },
  { date: new Date('2024-02-01'), value: 809 },
  { date: new Date('2024-03-01'), value: 231 },
  { date: new Date('2024-04-01'), value: 453 }
];

// Setting up our scales of axes
const xScale = d3.scaleTime().range([0, maxWidth]);
const yScale = d3.scaleLinear().range([maxHeight, 0]);

// Setting svg inside of #container
const svg = d3.select('#container').append('svg')
    .attr('width', xSize)
    .attr('height', ySize)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Setting up the domains of our scales
xScale.domain(d3.extent(data, d => d.date));
yScale.domain([0, d3.max(data, d => d.value)]);

// Adding axes to our svg
const xAxis = d3.axisBottom(xScale)
    .ticks(d3.timeMonth.every(3))
    .tickFormat(d3.timeFormat('%b %Y'));

svg.append('g')
    .attr('transform', `translate(0, ${maxHeight})`)
    .call(xAxis);

svg.append('g')
    .call(d3.axisLeft(yScale));

// Adding line to our svg
const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));

// Drawing the line using our generator and data
svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('d', line);
