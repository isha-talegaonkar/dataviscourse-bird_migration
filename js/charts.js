const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;

function setup (data) {
  for (let element of data) {
    let num = parseInt(element['OBSERVATION COUNT'])
    if(isNaN(parseInt(element['OBSERVATION COUNT']))){
      element['obsCount'] = 0;
    }
    else{
      element['obsCount'] = num
    }
    const [day, month, year] = element['OBSERVATION DATE'].split('/');
    element['obsDate'] = new Date(+year, month - 1, +day);
  }

  let line = d3.selectAll(".line-chart")

  line.append('g').attr('id', 'line-yaxis');
  line.append('g').attr('id', 'line-xaxis');
  line.append('path').attr('id', 'line-path')
  
  let scatter = d3.selectAll(".scatter-plot")

  scatter.append('g').attr('id', 'scatter-yaxis');
  scatter.append('g').attr('id', 'scatter-xaxis');

  drawLineChart(data)
  drawScatterPlot(data)
}
function drawLineChart(data){
  
  var xScale = d3.scaleTime().domain(data.map(function(d) { 
    const [day, month, year] = d['OBSERVATION DATE'].split('/');
    const date = new Date(+year, month - 1, +day);
    return date }))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right])
  
    var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return parseInt(d['OBSERVATION COUNT']); })])
    .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0]).nice();

  const lineGenerator = d3.line().x(function(d,i) { 
    const [day, month, year] = d['OBSERVATION DATE'].split('/');
    const date = new Date(+year, month - 1, +day);  
    return xScale(date)
  })
  .y(d => yScale(parseInt(d['OBSERVATION COUNT'])) + MARGIN.top)

  let svg = d3.selectAll(".line-chart")

  d3.selectAll('#line-yaxis')
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .call(d3.axisLeft(yScale))
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  d3.selectAll('#line-xaxis')
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
  .call(d3.axisBottom(xScale));

  svg.select("#line-path")
  .datum(data)
  .attr("d", lineGenerator)
}

function drawScatterPlot(data){
  let xScale = d3
    .scaleBand()
    .domain(data.map((d) => d['COUNTY']))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right])

    // https://github.com/d3/d3-scale
  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => parseInt(d['OBSERVATION COUNT']))])
    .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
    .nice();

  let svg = d3.selectAll(".scatter-plot");

  d3.select("#scatter-yaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .call(d3.axisLeft(yScale))
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  svg.select("#scatter-xaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
  .call(d3.axisBottom(xScale));

  svg.selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", function (d) { return xScale(d['COUNTY']); })
  .attr("cy", function (d) { return yScale(parseInt(d['OBSERVATION COUNT'])) + MARGIN.top; })
  .attr("r", 5)
}