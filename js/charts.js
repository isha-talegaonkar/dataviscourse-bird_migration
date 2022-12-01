

const CHART_WIDTH = 550;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;

setup();
function setup () {

  let bar = d3.selectAll('.bar-chart')

  bar.append("g").attr('id','bar-yaxis')
  bar.append('g').attr('id', 'bar-xaxis');
  
  let scatter = d3.selectAll(".scatter-plot")

  scatter.append('g').attr('id', 'scatter-yaxis');
  scatter.append('g').attr('id', 'scatter-xaxis');

  loadData();

  d3.select("#dataset").on("change", function (event) {
    loadData();
  });

  // d3.select("#year").on("change", function (event) {
  //   loadData();
  // });

}

function update(data, dataFile){
  // console.log(data)
  drawBarChart(data)
  drawScatterPlot(data)
  updateBoxContents(data, dataFile)
}

function drawScatterPlot(data){

  var result = [];
  data.reduce(function(res, value) {
    if (!res[value['STATE']]) {
      res[value['STATE']] = { STATE: value['STATE'], obsCount: 0 };
      result.push(res[value['STATE']])
    }
    res[value['STATE']].obsCount += value.obsCount;
    return res;
  }, {});
  
  // console.log(result)

  const topN = (arr, n) => {
    if(n > arr.length){
       return false;
    }
    return arr
    .slice()
    .sort((a, b) => {
       return b.obsCount - a.obsCount
    })
    .slice(0, n);
  };

  if(result.length > 10){
    res = topN(result, 10);
  }
  else{
    res = topN(result, result.length);
  }

  // console.log(res)
  let xScale = d3
    .scaleBand()
    .domain(res.map((d) => d['STATE']))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right])

  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(res, d => parseInt(d['obsCount']))])
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
  .attr("cx", function (d) { return xScale(d['STATE']); })
  .attr("cy", function (d) { return yScale(parseInt(d['obsCount'])) + MARGIN.top; })
  .attr("r", 5)
}

function drawBarChart (data) {
  // console.log("In bar chart: ",data)
  var height = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  var result = []
  data.reduce(function(res, value) {
    if (!res[value['MONTH']]) {
      res[value['MONTH']] = { MONTH: value['MONTH'], obsCount: 0 };
      result.push(res[value['MONTH']])
    }
    res[value['MONTH']].obsCount += value.obsCount;
    return res;
  }, {});

  let xScale = d3
    .scaleBand()
    .domain(result.map((d) => d['MONTH']))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right])

  var yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d['obsCount']; })])
  .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
  // .nice();

  svg = d3.selectAll(".bar-chart")

  console.log(result['MONTH'])
  function sortByMonth(arr) {
    var months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"];
    arr.sort(function(a, b){
        return months.indexOf(a['MONTH'])
             - months.indexOf(b['MONTH']);
    });
  }

  sortByMonth(result);
  console.log(result)
  d3.selectAll("#bar-yaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .call(d3.axisLeft(yScale))
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  d3.selectAll("#bar-xaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(10,${CHART_HEIGHT - MARGIN.bottom})`)
  .call(d3.axisBottom(xScale));

  svg.selectAll("rect")
  .data(data)
  .join("rect")
  .transition() 
  .duration(1000)
  .attr("x", function(d,i) { 
    // console.log(d['MONTH'])
    return xScale(d['MONTH']); 
  })
  .attr("y", function(d) { 
    return yScale(d['obsCount']) + MARGIN.top; 
  })
  .attr("width", function(d){ 
    return 20;
  })
  .attr("height", function(d) { 
    // console.log(d['obsCount'])
    return height - yScale(d['obsCount']); }) 

  svg.selectAll("rect")
  .on("mouseover",function (event) {
    //console.log(event.currentTarget)
    d3.select(event.currentTarget).classed("hovered", true);
  })
  .on("mouseout",function (event) {
    d3.select(event.currentTarget).classed("hovered", false);
  });
}

function updateBoxContents(data, dataFile){
  console.log(data)
  let name = data[0]['COMMON NAME']
  let sc_name = data[0]['SCIENTIFIC NAME']

  d3.select('#bird-image')
  .attr("src", function(d) {
    return `data/${dataFile}.png`
  })

  d3.select('#title')
  .text(name)

  d3.select('#box-body')
  .text("Scientific Name: "+sc_name)

  d3.select('#cons-img')
  .attr('src', function(d){
    return `data/${dataFile}_threatened.png`
  })


}
async function loadData() {

  let birdData;
  const dataFile = d3.select('#dataset').property('value');
  console.log(dataFile)
  birdData = await d3.csv(`data/${dataFile}_filtered.csv`);

  for (let element of birdData) {
    let num = parseInt(element['OBSERVATION COUNT'])
    if(isNaN(parseInt(element['OBSERVATION COUNT']))){
      element['obsCount'] = 0;
    }
    else{
      element['obsCount'] = num
    }
    var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug","Sep","Oct","Nov","Dec"];
    let mon = parseInt(element['MONTH'])
    element['MONTH'] = month[mon-1]
    
  }


  update(birdData, dataFile)
}