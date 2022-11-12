const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;

function setup (data) {
  let line = d3.selectAll(".line-chart")

  line.append('g').attr('id', 'line-yaxis');
  line.append('g').attr('id', 'line-xaxis');
  line.append('path').attr('id', 'line-path')
  
  let scatter = d3.selectAll(".scatter-plot")

  scatter.append('g').attr('id', 'scatter-yaxis');
  scatter.append('g').attr('id', 'scatter-xaxis');
  drawCharts(data)
}
function drawCharts(data){
console.log("hi")


}