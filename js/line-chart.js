const SVG_WIDTH = 700;
const SVG_HEIGHT = 500;
const MARGIN = { left: 80, right: 0, top: 50, bottom: 50 };
const CHART_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const CHART_HIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const ANIMATION_DURATION = 300;
let mappingData = [];

/** Class representing the line chart view. */
class LineChart {
  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState;
    this.setupChart();
    this.updateLineChart();
  }

  processContinentData(covidData) {
    this.groupedData = d3.group(covidData, (d) => {
      if (d.iso_code.startsWith("OWID")) {
        this.defaultKey = d.iso_code;
        return d.iso_code;
      }
    });
    this.groupedData.delete(undefined);

    this.max_cases_per_selection = [];
    this.groupedData.forEach((value, key) => {
      let max = 0.0;
      if (typeof value !== "undefined" && value.length > 0) {
        let max_value = Math.max(
          ...value.map((o) => {
            let cases =
              o.total_cases_per_million === ""
                ? "0.00"
                : o.total_cases_per_million;
            return parseInt(cases);
          })
        );
        max = isNaN(max_value) ? 0 : max_value;
      }
      this.max_cases_per_selection.push(max);
    });
  }

  processCountriesData(covidData, countries) {
    this.groupedData = d3.group(covidData, (d) => {
      if (countries.includes(d.iso_code)) {
        this.defaultKey = d.iso_code;
        return d.iso_code;
      }
    });
    this.groupedData.delete(undefined);

    this.max_cases_per_selection = [];
    this.groupedData.forEach((value, key) => {
      let max = 0.0;
      if (typeof value !== "undefined" && value.length > 0) {
        let max_value = Math.max(
          ...value.map((o) => {
            let cases =
              o.total_cases_per_million === ""
                ? "0.00"
                : o.total_cases_per_million;
            return parseInt(cases);
          })
        );
        max = isNaN(max_value) ? 0 : max_value;
      }
      this.max_cases_per_selection.push(max);
    });
  }

  updateSelectedCountries() {}

  setupChart() {
    const svg = d3.select(`#line-chart`);

    const chart = svg
      .select(`#lines`)
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    const x_axis = svg
      .select(`#x-axis`)
      .attr(
        "transform",
        `translate(${MARGIN.left}, ${MARGIN.top + CHART_HIGHT})`
      );

    svg
      .append("text")
      .attr("id", `x-axis-label`)
      .attr("x", (CHART_WIDTH + MARGIN.left + MARGIN.right) / 2)
      .attr("y", CHART_HIGHT + MARGIN.top + MARGIN.bottom)
      .attr("text-anchor", "middle")
      .style("font-family", "Helvetica")
      .style("font-size", 12);

    // y-axis
    const y_axis = svg
      .select(`#y-axis`)
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    svg
      .append("text")
      .attr("id", `y-axis-label`)
      .attr(
        "transform",
        `translate(10, ${
          (CHART_HIGHT + MARGIN.top + MARGIN.bottom) / 2
        }) rotate(-90)`
      )
      .attr("text-anchor", "middle")
      .style("font-family", "Helvetica")
      .style("font-size", 12);
  }

  updateLineChart() {
    let countriesSelected = this.globalApplicationState.selectedLocations;
    if (countriesSelected.length > 0) {
      this.processCountriesData(
        this.globalApplicationState.covidData,
        countriesSelected
      );
    } else {
      this.processContinentData(this.globalApplicationState.covidData);
    }

    let processedData = this.groupedData;
    let data = processedData.get(this.defaultKey);
    if (typeof data === "undefined") {
      const chart = d3.select("#line-chart");
      chart.select("#lines").selectAll("*").remove();
      mappingData = [];
      return;
    }
    const x_axis_data_name = "date";
    const given_format = "%Y-%m-%d";
    let parseDate = d3.timeParse(given_format);
    const required_format = "%b %Y";
    const formatDate = d3.timeFormat(required_format);

    const x_domain = d3.extent(data, function (d) {
      return parseDate(d.date);
    });

    // data.map((o) => {
    //   if (o.total_cases_per_million === "") {
    //     o.total_cases_per_million = 0;
    //   } else {
    //     o.total_cases_per_million = parseInt(o.total_cases_per_million);
    //   }
    // });

    const x_scale = d3.scaleTime().range([0, CHART_WIDTH]);
    x_scale.domain(x_domain).ticks(30);
    const x_axis_generator = d3
      .axisBottom()
      .scale(x_scale)
      .tickFormat(formatDate);

    const y_axis_data_name = "total_cases_per_million";
    const y_domain = [0, d3.max(this.max_cases_per_selection)];
    const y_scale = d3.scaleLinear().range([CHART_HIGHT, 0]).domain(y_domain);
    const y_axis_generator = d3.axisLeft(y_scale).tickSizeOuter(0);

    const x_axis = d3.select("#x-axis");
    x_axis.call(x_axis_generator);

    const y_axis = d3.select("#y-axis");
    y_axis.call(y_axis_generator);

    const x_label = d3.select("#x-axis-label");
    x_label.text("Date");

    const y_label = d3.select("#y-axis-label");
    y_label.text("Cases per million");

    const chart = d3.select("#line-chart");
    let lineColorScale = d3
      .scaleOrdinal(d3.schemeTableau10)
      .domain(this.groupedData.keys());

    chart
      .select("#lines")
      .selectAll("path")
      .data(this.groupedData)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", ([group, values]) => lineColorScale(group))
      .attr("stroke-width", 1)
      .attr("d", ([group, values]) =>
        d3
          .line()
          .x((d) => x_scale(parseDate(d[x_axis_data_name])))
          .y((d) => y_scale(d[y_axis_data_name]))(values)
      );
    mappingData = [];
    for (let [key, value] of this.groupedData) {
      value.map((o) => {
        if (o.total_cases_per_million === "") {
          o.total_cases_per_million = 0;
        } else {
          o.total_cases_per_million = parseInt(o.total_cases_per_million);
        }
      });
      mappingData.push(...value);
    }
    console.log(mappingData);
    chart.on("mousemove", (event) => {
      // console.log(event.clientX, event.clientY);
      // console.log(`innerWidth: ${innerWidth}, innerHeight: ${innerHeight}`);
      if (
        event.clientX >
          innerWidth - SVG_WIDTH + MARGIN.left + MARGIN.right - 30 &&
        event.clientX < innerWidth - MARGIN.right &&
        event.clientY > MARGIN.top - MARGIN.bottom
        // event.clientY < innerHeight
      ) {
        // console.log(event.clientX, event.clientY);
        // Set the line position
        let overlayLine = chart.select("#overlay").select("line");
        if (overlayLine.empty()) {
          overlayLine = chart.select("#overlay").append("line");
        }
        overlayLine
          .attr("stroke", "black")
          .attr("x1", event.clientX - SVG_WIDTH - MARGIN.left)
          .attr("x2", event.clientX - SVG_WIDTH - MARGIN.left)
          .attr("y1", MARGIN.top)
          .attr("y2", SVG_HEIGHT - MARGIN.bottom);

        // Find the relevant data (by date and location)
        const required_format = "%Y-%m-%d";
        const formatDate = d3.timeFormat(required_format);
        const dateHovered = formatDate(
          x_scale.invert(
            event.clientX - SVG_WIDTH - MARGIN.left - MARGIN.right - 80
          )
        );
        const filteredData = mappingData
          .filter((row) => row.date === dateHovered)
          .sort(
            (rowA, rowB) =>
              rowB.total_cases_per_million - rowA.total_cases_per_million
          );

        chart
          .select("#overlay")
          .selectAll("text")
          .data(filteredData)
          .join("text")
          .text(
            (d) =>
              `${d.location} - ${d3.format(".2s")(d.total_cases_per_million)}`
          )
          .attr("x", () => {
            if (event.clientX > (innerWidth + SVG_WIDTH) / 2) {
              return event.clientX - SVG_WIDTH - MARGIN.right - 280;
            }
            return event.clientX - SVG_WIDTH - MARGIN.right;
          })
          .attr("y", (d, i) => 20 * i + 20)
          .attr("alignment-baseline", "hanging")
          .attr("stroke", (d) => lineColorScale(d.iso_code));
      }
    });
  }
}
