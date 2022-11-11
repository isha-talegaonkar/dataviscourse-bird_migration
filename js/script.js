// ******* DATA LOADING *******
// We took care of that for you
async function loadData() {
  const birdData = await d3.text("data/ebd_swahaw_202001_202012_relSep-2022/ebd_swahaw_202001_202012_relSep-2022.txt");
  // const mapData = await d3.json("data/land-50m.json");
  return { birdData };
}

// ******* STATE MANAGEMENT *******
// This should be all you need, but feel free to add to this if you need to
// communicate across the visualizations
const globalApplicationState = {
  selectedLocations: [],
  covidData: null,
  mapData: null,
  usa: null,
  worldMap: null,
  lineChart: null,
};

//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {
  // console.log("Here is the imported data:", loadedData.covidData);

  let birdData = loadedData.birdData
  var cells = birdData.split('\n').map(function (el) { return el.split(/\t+/); });
  var headings = cells.shift();

  var obj = cells.map(function (el) {
    var obj = {};
    for (var i = 0, l = el.length; i < l; i++) {
      obj[headings[i]] = isNaN(Number(el[i])) ? el[i] : +el[i];
    }
    return obj;
  });

  console.log(obj)
  // Store the loaded data into the globalApplicationState
  // globalApplicationState.covidData = loadedData.covidData;
  // globalApplicationState.mapData = loadedData.mapData;
  // globalApplicationState.usa = loadedData.usa;

  // // Creates the view objects with the global state passed in
  // const worldMap = new MapVis(globalApplicationState);
  // const lineChart = new LineChart(globalApplicationState);

  // globalApplicationState.worldMap = worldMap;
  // globalApplicationState.lineChart = lineChart;

  // //TODO add interactions for Clear Selected Countries button
  // d3.select("#clear-button").on("click", () => {
  //   d3.select("#overlay").selectAll("*").remove();
  //   d3.select("#countries").selectAll("path").attr("class", "country");
  //   globalApplicationState.selectedLocations = [];
  //   lineChart.updateLineChart();
  // });
});
