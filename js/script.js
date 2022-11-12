// ******* DATA LOADING *******
// We took care of that for you
async function loadData() {
  const birdData = await d3.csv("data/ebd_US_goleag_202001_202112_relSep-2022.csv");
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
  console.log("Here is the imported data:", loadedData.birdData);

  let birdData = loadedData.birdData

  setup(birdData);

});
