// ******* DATA LOADING *******
// We took care of that for you
async function loadData() {
  const covidData = await d3.csv("data/owid-covid.csv");
  const mapData = await d3.json("data/land-50m.json");
  return { covidData, mapData };
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

  // Store the loaded data into the globalApplicationState
  globalApplicationState.covidData = loadedData.covidData;
  globalApplicationState.mapData = loadedData.mapData;
  globalApplicationState.usa = loadedData.usa;

  // Creates the view objects with the global state passed in
  const worldMap = new MapVis(globalApplicationState);
  const lineChart = new LineChart(globalApplicationState);

  globalApplicationState.worldMap = worldMap;
  globalApplicationState.lineChart = lineChart;

  //TODO add interactions for Clear Selected Countries button
  d3.select("#clear-button").on("click", () => {
    d3.select("#overlay").selectAll("*").remove();
    d3.select("#countries").selectAll("path").attr("class", "country");
    globalApplicationState.selectedLocations = [];
    lineChart.updateLineChart();
  });
});
