/** Class representing the map view. */
class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState;
    this.renderCountries();
  }

  updateSelectedCountries(d) {
    d3.select("#overlay").selectAll("*").remove();
    let currentIndex = this.globalApplicationState.selectedLocations.indexOf(
      d.currentTarget.__data__.id
    );
    if (currentIndex !== -1) {
      this.globalApplicationState.selectedLocations.splice(currentIndex, 1);
      d.currentTarget.setAttribute("class", "country");
    } else {
      this.globalApplicationState.selectedLocations.push(
        d.currentTarget.__data__.id
      );
      d.currentTarget.setAttribute("class", "country selected");
    }
    this.globalApplicationState.lineChart.updateLineChart();
  }

  renderCountries() {
    const formatLongitude = (x) => `${Math.abs(x)}°${x < 0 ? "W" : "E"}`;
    const formatLatitude = (y) => `${Math.abs(y)}°${y < 0 ? "S" : "N"}`;
    const margin = { top: 30, right: 40, bottom: 30, left: 40 };
    const mapData = this.globalApplicationState.mapData;
    const covidData = this.globalApplicationState.covidData;
    const longitude = -100;
    let groupedCovidData = d3.group(covidData, (d) => d.iso_code);
    console.log(groupedCovidData);
    // const countries = topojson.feature(mapData, mapData.objects.countries);
    const countries = topojson.feature(mapData, mapData.objects.land);

    // const projection = d3.geoWinkel3().scale(140).translate([400, 250]);
    const projection = d3.geoStereographic().rotate([-longitude, 0]);
    // const path = d3.geoPath().projection(projection);
    const path = d3.geoPath(projection);
    // const graticule = d3.geoGraticule();
    const graticule = d3.geoGraticule10();

    const outline = d3.geoCircle().radius(90).center([longitude, 0])();
    const offset = ([x, y], k) => {
      const [cx, cy] = projection.translate();
      const dx = x - cx;
      const dy = y - cy;
      k /= Math.hypot(dx, dy);
      return [x + dx * k, y + dy * k];
    };
    const width = 1052;
    const [[x0, y0], [x1, y1]] = d3
      .geoPath(projection.fitWidth(width, outline))
      .bounds(outline);

    const dx = x1 - x0;
    const k = (dx - margin.left - margin.right) / dx;
    const dy = (y1 - y0) * k + margin.bottom + margin.top;
    projection.scale(projection.scale() * k);
    projection.translate([
      (dx + margin.left - margin.right) / 2,
      (dy + margin.top - margin.bottom) / 2,
    ]);
    projection.precision(0.2);
    const height = Math.round(dy);
    // height = {
    //   const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
    //   const dx = x1 - x0;
    //   const k = (dx - margin.left - margin.right) / dx;
    //   const dy = (y1 - y0) * k + margin.bottom + margin.top;
    //   projection.scale(projection.scale() * k);
    //   projection.translate([(dx + margin.left - margin.right) / 2, (dy + margin.top - margin.bottom) / 2]);
    //   projection.precision(0.2);
    //   return Math.round(dy);
    // }

    const svg = d3.select("#map");
    // svg.attr("width", width);
    // svg.attr("height", height);

    svg
      .select("#graticules")
      .append("path")
      .attr("d", path(graticule))
      .attr("fill", "none")
      .attr("stroke", "black")
      .style("opacity", 0.2);

    svg
      .select("#graticules")
      .append("path")
      .datum(graticule.outline)
      .attr("class", "graticule outline")
      .attr("d", path);
    // TODO
    const colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, 660000]);

    const country_path = svg
      .select("#countries")
      .selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "country")
      .attr("fill", (d) => {
        let array = groupedCovidData.get(d.id);
        let max = 0.0;
        if (typeof array !== "undefined" && array.length > 0) {
          let value = Math.max(
            ...array.map((o) => {
              let cases =
                o.total_cases_per_million === ""
                  ? "0.00"
                  : o.total_cases_per_million;
              return parseInt(cases);
            })
          );
          max = isNaN(value) ? 0 : value;
        }
        return colorScale(max);
      })
      .attr("stroke", "lightgrey");

    country_path.on("click", (d) => this.updateSelectedCountries(d));
    // svg
    //   .append("defs")
    //   .append("linearGradient")
    //   .attr("id", "legend-gradient")
    //   .attr("x1", "0%")
    //   .attr("y1", "0%")
    //   .attr("x2", "50%")
    //   .attr("y2", "0%")
    //   .attr("x2", "100%")
    //   .attr("y2", "0%")
    //   .selectAll("stop")
    //   .data(d3.range(0, 1200000, 400000))
    //   .enter()
    //   .append("stop")
    //   .attr("offset", function (d, i) {
    //     return i;
    //   })
    //   .attr("stop-color", function (d, i) {
    //     return colorScale(d);
    //   });

    // const legendGradient = svg
    //   .append("defs")
    //   .append("linearGradient")
    //   .attr("id", "legend-gradient");

    // legendGradient
    //   .append("stop")
    //   .attr("offset", "0")
    //   .attr("stop-color", "rgb(255, 245, 240)");

    // legendGradient
    //   .append("stop")
    //   .attr("offset", "0.5")
    //   .attr("stop-color", "rgb(251, 129, 98)");

    // legendGradient
    //   .append("stop")
    //   .attr("offset", "1")
    //   .attr("stop-color", "rgb(100, 0, 0)");

    // d3.select("#lagend")
    //   .append("rect")
    //   .attr("width", 150)
    //   .attr("y", 0)
    //   .attr("height", 20)
    //   .attr("transform", "translate(0 475)")
    //   .attr("fill", "url(#legend-gradient)");

    // d3.select("#lagend")
    //   .append("text")
    //   .attr("transform", "translate(0 470)")
    //   .text("0");
    // d3.select("#lagend")
    //   .append("text")
    //   .attr("transform", "translate(120 470)")
    //   .text("660k");
  }
}
