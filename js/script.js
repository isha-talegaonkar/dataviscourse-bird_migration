require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/TimeSlider",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
], (Map, MapView, GeoJSONLayer, TimeSlider, Expand, Legend) => {
  //Chart Code
  let CHART_WIDTH = 700;
  let CHART_HEIGHT = 400;
  const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
  const ANIMATION_DURATION = 300;
  let mapInitialized = false;
  let timeSlider;
  let view;
  let layerView;
  let selectedYear;
  let selectedSliderSpeed;

  setup();
  function setup() {
    let bar = d3.selectAll(".bar-chart1");

    bar.append("g").attr("id", "bar-yaxis");
    bar.append("g").attr("id", "bar-xaxis");

    let scatter = d3.selectAll(".bar-chart2");

    scatter.append("g").attr("id", "scatter-yaxis");
    scatter.append("g").attr("id", "scatter-xaxis");

    let line = d3.selectAll(".line-chart");

    line.append("g").attr("id", "line-yaxis");
    line.append("g").attr("id", "line-xaxis");
    line.append("path").attr("id", "line-path");

    let line1 = d3.selectAll(".line-chart1");

    line1.append("g").attr("id", "line1-yaxis");
    line1.append("g").attr("id", "line1-xaxis");
    line1.append("path").attr("id", "line1-path");

    loadData();

    d3.select("#dataset").on("change", function (event) {
      loadData();
    });

    d3.select("#year").on("change", function (event) {
      loadData();
    });

    d3.select("#sliderSpeed").on("change", function (event) {
      loadData();
    });
  }

  function update(data, dataFile) {
    // console.log(data)
    drawBarChart(data);
    drawScatterPlot(data);
    updateBoxContents(data, dataFile);
    drawLineFromMap(data, "California");
  }

  function drawScatterPlot(data) {
    var height = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
    var result = [];
    data.reduce(function (res, value) {
      if (!res[value["STATE"]]) {
        res[value["STATE"]] = { STATE: value["STATE"], obsCount: 0 };
        result.push(res[value["STATE"]]);
      }
      res[value["STATE"]].obsCount += value.obsCount;
      return res;
    }, {});

    // console.log(result)

    const topN = (arr, n) => {
      if (n > arr.length) {
        return false;
      }
      return arr
        .slice()
        .sort((a, b) => {
          return b.obsCount - a.obsCount;
        })
        .slice(0, n);
    };

    if (result.length > 10) {
      res = topN(result, 10);
    } else {
      res = topN(result, result.length);
    }


    d3.select("#barchart-text")
    .text("Top regions in which the bird is found")

    function compare(a, b) {
      if (a.obsCount < b.obsCount) {
        return -1;
      }
      if (a.obsCount > b.obsCount) {
        return 1;
      }
      return 0;
    }

    result.sort(compare);

    d3.select("#barchart-text").text("Top regions in which the bird is found");

    // console.log(res)
    let xScale = d3
      .scaleBand()
      .domain(res.map((d) => d["STATE"]))
      .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(res, (d) => parseInt(d["obsCount"]))])
      .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
      .nice();

    let svg = d3.selectAll(".bar-chart2");

    d3.select("#scatter-yaxis")
      .style("stroke", "black")
      .style("stroke-width", "0.5")
      .call(d3.axisLeft(yScale))
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    svg
      .select("#scatter-xaxis")
      .style("stroke", "black")
      .style("stroke-width", "0.5")
      .attr("transform", `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(xScale));


    // svg.selectAll("circle")
    // .data(res)
    // .join("circle")
    // .attr("cx", function (d) { return xScale(d['STATE']); })
    // .attr("cy", function (d) { return yScale(parseInt(d['obsCount'])) + MARGIN.top; })
    // .attr("r", 5)

    let tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('padding', '10px')
    .style('background', 'rgba(0,0,0,0.6)')
    .style('border-radius', '4px')
    .style('color', '#fff')
    .text('a simple tooltip');

    svg
      .selectAll("rect")
      .data(res)
      .join("rect")
      .transition()
      .duration(1000)
      .attr("x", function (d, i) {
        // console.log(d['MONTH'])
        return xScale(d["STATE"]) + 20;
      })
      .attr("y", function (d) {
        return yScale(d["obsCount"]) + MARGIN.top;
      })
      .attr("width", function (d) {
        return 20;
      })
      .attr("height", function (d) {
        // console.log(d['obsCount'])
        return height - yScale(d["obsCount"]);
      });

    svg
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        //console.log(event.currentTarget)
        tooltip
        .html(
          `<div>Observation Count: ${d.obsCount}</div>`
        )
        .style('visibility', 'visible');
        d3.select(event.currentTarget).classed("hovered", true);
      })
      .on("mouseout", function (event) {
        tooltip.html(``).style('visibility', 'hidden');
        d3.select(event.currentTarget).classed("hovered", false);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px');
    })
      .on("click", function (event, d) {
        // console.log(d['STATE'])
        drawLineChart(data, d["STATE"]);
      });
  }

  function drawLineChart(data, state) {
    // console.log(state)

    let country;
    let filtered_data = [];
    let country;
    for (let element of data) {
      if (element["STATE"] == state) {
        country = element['COUNTRY']
        let date = new Date(element["OBSERVATION DATE"]);
        element["YEAR"] = date.getFullYear();
        filtered_data.push(element);
      }
    }

    let result = [];
    filtered_data.reduce(function (res, value) {
      if (!res[value["YEAR"]]) {
        res[value["YEAR"]] = { YEAR: value["YEAR"].toString(), obsCount: 0, country: "" };
        result.push(res[value["YEAR"]]);
      }
      res[value["YEAR"]].obsCount += value.obsCount;
      res[value['YEAR']].country = value['COUNTRY']
      return res;
    }, {});

    console.log(result);

    function compare( a, b ) {
      if ( a.obsCount < b.obsCount ){
        return -1;
      }
      if ( a.obsCount > b.obsCount ){
        return 1;
      }
      return 0;
    }

    result.sort(compare)

    // var xScale = d3.scaleBand().domain(result.map(d => d['YEAR'])).range([MARGIN.left, CHART_WIDTH - MARGIN.right]);
    // var yScale = d3.scaleLinear().domain([0, d3.max(result, function(d) { return d['obsCount']; })]).range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0]).nice();

    // let svg = d3.selectAll(".line-chart")

    // d3.selectAll('#line-yaxis')
    // .style("stroke", "black")
    // .style("stroke-width", "0.5")
    // .call(d3.axisLeft(yScale))
    // .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

    // d3.selectAll('#line-xaxis')
    // .style("stroke", "black")
    // .style("stroke-width", "0.5")
    // .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
    // .call(d3.axisBottom(xScale))
    // .tickValues()

    // const lineGenerator = d3.line()
    // .x((d,i) => (xScale(d['YEAR'])) + 12)
    // .y(d => yScale(d['obsCount']) + MARGIN.top)

    // svg.select("#line-path")
    // .datum(result)
    // .attr("d", lineGenerator)

    d3.select('#piechart-text')
    .text(`Distribution of bird sightings over the years in ${state}, ${country}`)
    var text = "";

    var thickness = 40;
    var duration = 750;

    var radius = Math.min(CHART_WIDTH, CHART_HEIGHT) / 2;
    var color = d3.scaleOrdinal(d3.schemeSpectral[result.length]);

    var svg = d3
      .select(".line-chart")
      .append("svg")
      .attr("class", "pie")
      .attr("width", CHART_WIDTH)
      .attr("height", CHART_HEIGHT);

    var g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + CHART_WIDTH / 2 + "," + CHART_HEIGHT / 2 + ")"
      );

    var arc = d3
      .arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius);

    var pie = d3
      .pie()
      .value(function (d) {
        return d["obsCount"];
      })
      .sort(null);

    var path = g
      .selectAll("path")
      .data(pie(result))
      .enter()
      .append("g")
      .on("mouseover", function (d) {
        let g = d3
          .select(this)
          .style("cursor", "pointer")
          .style("fill", "black")
          .append("g")
          .attr("class", "text-group");

        g.append("text")
          .attr("class", "name-text")
          .text(function (d) {
            // console.log(d);
            return `Year: ${d.data["YEAR"]}`;
          })
          .attr("text-anchor", "middle")
          .attr("dy", "-1.2em");

        g.append("text")
          .attr("class", "value-text")
          .text(function (d){ 
            console.log(d)
            return `${d.data["obsCount"]} birds observed`})
          .attr("text-anchor", "middle")
          .attr("dy", ".6em");
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .style("cursor", "none")
          .style("fill", color(this._current))
          .select(".text-group")
          .remove();
      })
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .on("mouseover", function (d) {
        d3.select(this).style("cursor", "pointer").style("fill", "black");
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .style("cursor", "none")
          .style("fill", color(this._current));
      })
      .each(function (d, i) {
        this._current = i;
      });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(text);

    d3.select("#piechart-text").text(
      `Distribution of bird sightings over the years in ${state}, ${country}`
    );
  }

  function drawBarChart(data) {
    // console.log("In bar chart: ",data)
    var height = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

    var result = [];
    data.reduce(function (res, value) {
      if (!res[value["MONTH"]]) {
        res[value["MONTH"]] = { MONTH: value["MONTH"], obsCount: 0 };
        result.push(res[value["MONTH"]]);
      }
      res[value["MONTH"]].obsCount += value.obsCount;
      return res;
    }, {});

    let xScale = d3
      .scaleBand()
      .domain(result.map((d) => d["MONTH"]))
      .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);
    // .padding(0.2)

    var yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return d["obsCount"];
        }),
      ])
      .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
      .nice();

    svg = d3.selectAll(".bar-chart1");

    // console.log(result['MONTH'])
    function sortByMonth(arr) {
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      arr.sort(function (a, b) {
        return months.indexOf(a["MONTH"]) - months.indexOf(b["MONTH"]);
      });
    }

    // sortByMonth(result);
    // console.log(result)

    d3.selectAll("#bar-yaxis")
      .style("stroke", "black")
      .style("stroke-width", "0.5")
      .call(d3.axisLeft(yScale))
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    d3.selectAll("#bar-xaxis")
      .style("stroke", "black")
      .style("stroke-width", "0.5")
      .attr("transform", `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(xScale));

    svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .transition()
      .duration(1000)
      .attr("x", function (d, i) {
        // console.log(d['MONTH'])
        return xScale(d["MONTH"]) + 12;
      })
      .attr("y", function (d) {
        return yScale(d["obsCount"]) + MARGIN.top;
      })
      .attr("width", function (d) {
        return 20;
      })
      .attr("height", function (d) {
        // console.log(d['obsCount'])
        return height - yScale(d["obsCount"]);
      });

    svg
      .selectAll("rect")
      .on("mouseover", function (event) {
        //console.log(event.currentTarget)
        d3.select(event.currentTarget).classed("hovered", true);
      })
      .on("mouseout", function (event) {
        d3.select(event.currentTarget).classed("hovered", false);
      });
  }

  function drawLineFromMap(data, state, country = "United States", month = 0) {
    let CHART_WIDTH = 300;
    let CHART_HEIGHT = 250;
    // console.log(data)
    // state = "Utah";

    let filtered_data = [];
    for (let element of data) {
      let date1 = new Date(element["OBSERVATION DATE"]);
      let mon = date1.getMonth();
      if (
        element["STATE"] == state
        // && element["COUNTRY"] == country
        // && mon == month
      ) {
        let date = new Date(element["OBSERVATION DATE"]);
        element["YEAR"] = date.getFullYear();
        filtered_data.push(element);
      }
    }
    let result = [];
    filtered_data.reduce(function (res, value) {
      // console.log(value['DURATION MINUTES'])
      if (!res[value["YEAR"]]) {
        res[value["YEAR"]] = { YEAR: value["YEAR"], LENGTH: 0, DURATION: 0 };
        result.push(res[value["YEAR"]]);
      }
      res[value["YEAR"]].LENGTH += 1;
      res[value["YEAR"]].DURATION += value["DURATION MINUTES"];
      return res;
    }, {});

    result.forEach((element) => {
      element["AVERAGE"] = element["DURATION"] / element["LENGTH"];
    });
    
    function compare( a, b ) {
      if ( a.YEAR < b.YEAR ){
        return -1;
      }
      if ( a.YEAR > b.YEAR ){
        return 1;
      }
      return 0;
    }
    // console.log(result)
    result.sort(compare)

    var xScale = d3
      .scaleBand()
      .domain(result.map((d) => d["YEAR"]))
      .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);
    var yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(result, function (d) {
          return d["AVERAGE"];
        }),
      ])
      .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
      .nice();

    let svg = d3.selectAll(".line-chart1");

    d3.selectAll("#line1-yaxis")
      .style("stroke", "black")
      .style("stroke-width", "0.5")
      .call(d3.axisLeft(yScale))
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    d3.selectAll("#line1-xaxis")
      .style("stroke", "black")
      .style("stroke-width", "0.5")
      .attr("transform", `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(xScale));

    const lineGenerator = d3
      .line()
      .x((d, i) => xScale(d["YEAR"]) + 15)
      .y((d) => yScale(d["AVERAGE"]) + MARGIN.top);

    svg.select("#line1-path")
    .datum(result)
    .attr("d", lineGenerator)
  }

  function updateBoxContents(data, dataFile) {
    // console.log(data)
    let name = data[0]["COMMON NAME"];
    let sc_name = data[0]["SCIENTIFIC NAME"];

    d3.select("#bird-image").attr("src", function (d) {
      return `data/${dataFile}/thumbnail.png`;
    });

    d3.select("#title").text(name);

    d3.select("#box-body").text("Scientific Name: " + sc_name);

    d3.select("#cons-img").attr("src", function (d) {
      return `data/${dataFile}/threatened.png`;
    });
  }
  async function loadData() {
    let birdData;
    const dataFile = d3.select("#dataset").property("value");
    selectedYear = d3.select("#year").property("value");
    selectedSliderSpeed = d3.select("#sliderSpeed").property("value");
    console.log(dataFile);
    birdData = await d3.csv(`data/${dataFile}/filtered.csv`);

    //Loading map related data

    for (let element of birdData) {
      let num = parseInt(element["OBSERVATION COUNT"]);
      if (isNaN(parseInt(element["OBSERVATION COUNT"]))) {
        element["obsCount"] = 0;
      } else {
        element["obsCount"] = num;
      }
      var month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      let mon = parseInt(element["MONTH"]);
      element["MONTH"] = month[mon - 1];
      element["DURATION MINUTES"] = parseInt(element["DURATION MINUTES"]);
      if (isNaN(element["DURATION MINUTES"])) {
        element["DURATION MINUTES"] = 0;
      }
    }
    update(birdData, dataFile);

    if (mapInitialized) {
      view.ui.remove(timeSlider);
    }
    let metaDataForMap = await d3.json(
      `data/${dataFile}/${selectedYear}/metadata.json`
    );
    let mapDataForMap = await d3.json(
      `data/${dataFile}/${selectedYear}/mapdata.json`
    );
    updateMapData(
      metaDataForMap,
      mapDataForMap,
      selectedYear,
      selectedSliderSpeed,
      birdData
    );
    mapInitialized = true;
  }

  //Chart Code End
  //Map Code Start
  function updateMapData(
    metaDataForMap,
    mapDataForMap,
    selectedYear,
    selectedSliderSpeed,
    birdData
  ) {
    console.log(mapDataForMap);
    console.log(metaDataForMap);
    const color = "yellow";
    const year = selectedYear;
    const countVisualVariable = {
      type: "size",
      field: "mag",
      minDataValue: metaDataForMap.minDataValue,
      maxDataValue: metaDataForMap.maxDataValue,
      minSize: 5,
      maxSize: 28.6,
    };

    const depthVisualVariable = {
      type: "color",
      field: "depth",
      stops: [
        {
          value: metaDataForMap.id,
          color: "#FF9573",
          label: metaDataForMap.name,
        },
      ],
    };

    const customPopupTemplate = {
      title: "{title}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "place",
              label: "Location",
              visible: true,
            },
            {
              fieldName: "mag",
              label: "Count",
              visible: true,
            },
            {
              fieldName: "duration",
              label: "Duration In Minutes",
              visible: true,
            },
          ],
        },
      ],
    };

    const timeInfo = {
      startField: "time", // name of the date field
      interval: {
        // set time interval to one day
        unit: selectedSliderSpeed,
        value: 1,
      },
    };

    const placeInfo = {
      startField: "place",
      value: "{place}",
    };

    let customRenderer = {
      type: "simple",
      field: "mag",
      symbol: {
        type: "simple-marker",
        color: color,
        outline: null,
      },
      visualVariables: [countVisualVariable, depthVisualVariable],
    };

    // create a new blob from geojson featurecollection
    const blob = new Blob([JSON.stringify(mapDataForMap)], {
      type: "application/json",
    });

    // URL reference to the blob
    const url = URL.createObjectURL(blob);

    // set the timeInfo on GeoJSONLayer at the time initialization
    const layer = new GeoJSONLayer({
      // url: "../../data/current/mapdata.json",
      url,
      title: "Bird Migration",
      // set the CSVLayer's timeInfo based on the date field
      timeInfo: timeInfo,
      placeInfo: placeInfo,
      renderer: customRenderer,
      popupTemplate: customPopupTemplate,
    });

    const map = new Map({
      basemap: "gray-vector",
      layers: [layer],
    });

    view = new MapView({
      map: map,
      container: "viewDiv",
      zoom: 2,
      center: [-84.087502, 9.934739],
    });

    // create a new time slider widget
    // set other properties when the layer view is loaded
    // by default timeSlider.mode is "time-window" - shows
    // data falls within time range
    timeSlider = new TimeSlider({
      container: "timeSlider",
      // playRate: 50,
      playRate: 500,
      stops: {
        interval: {
          value: 1,
          unit: selectedSliderSpeed,
        },
      },
    });
    view.ui.add(timeSlider, "bottom-left");

    // wait till the layer view is loaded
    view.whenLayerView(layer).then((lv) => {
      layerView = lv;

      // start time of the time slider - 5/25/2019
      const start = new Date(year, 00, 01);
      const endTime = new Date(year, 11, 31);
      // set time slider's full extent to
      // 5/25/5019 - until end date of layer's fullTimeExtent
      timeSlider.fullTimeExtent = {
        start: start,
        // end: layer.timeInfo.fullTimeExtent.end,
        end: endTime,
      };

      // We will be showing earthquakes with one day interval
      // when the app is loaded we will show earthquakes that
      // happened between 5/25 - 5/26.
      let end = new Date(start);
      // end of current time extent for time slider
      // showing earthquakes with one day interval
      // end.setDate(end.getDate() + 1);
      let step = 1;
      if (selectedSliderSpeed === "days") {
        step = 1;
      } else if (selectedSliderSpeed === "weeks") {
        step = 7;
      } else if (selectedSliderSpeed === "months") {
        step = 15;
      }
      end.setDate(end.getDate() + step);
      // timeExtent property is set so that timeslider
      // widget show the first day. We are setting
      // the thumbs positions.
      timeSlider.timeExtent = { start, end };
    });

    // // watch for time slider timeExtent change
    timeSlider.watch("timeExtent", () => {
      // only show earthquakes happened up until the end of
      // timeSlider's current time extent.
      layer.definitionExpression =
        "time <= " + timeSlider.timeExtent.end.getTime();

      // now gray out earthquakes that happened before the time slider's current
      // timeExtent... leaving footprint of earthquakes that already happened
      layerView.featureEffect = {
        filter: {
          timeExtent: timeSlider.timeExtent,
          geometry: view.extent,
        },
        excludedEffect: "grayscale(0%) opacity(0%)",
      };

      // run statistics on earthquakes fall within the current time extent
      const statQuery = layerView.featureEffect.filter.createQuery();
      statQuery.outStatistics = [
        magMax,
        magAvg,
        magMin,
        tremorCount,
        // avgDepth,
      ];

      layer
        .queryFeatures(statQuery)
        .then((result) => {
          let htmls = [];
          statsDiv.innerHTML = "";
          if (result.error) {
            return result.error;
          } else {
            if (result.features.length >= 1) {
              const attributes = result.features[0].attributes;
              console.log(attributes);
              for (name in statsFields) {
                if (attributes[name] && attributes[name] != null) {
                  let count = 0;
                  if (name === "Average_magnitude") {
                    count = attributes[name].toFixed(2);
                  } else {
                    count = attributes[name];
                  }
                  const html =
                    "<br/>" +
                    statsFields[name] +
                    ": <b><span> " +
                    // attributes[name].toFixed(2) +
                    count +
                    "</span></b>";
                  htmls.push(html);
                }
              }
              const yearHtml =
                "<span>" +
                result.features[0].attributes["tremor_count"] +
                "</span> bird counts were recorded between " +
                timeSlider.timeExtent.start.toLocaleDateString() +
                " - " +
                timeSlider.timeExtent.end.toLocaleDateString() +
                ".<br/>";

              if (htmls[0] == undefined) {
                statsDiv.innerHTML = yearHtml;
              } else {
                statsDiv.innerHTML = yearHtml + htmls[0] + htmls[1] + htmls[2];
                // + htmls[3];
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });

    const avgDepth = {
      onStatisticField: "depth",
      outStatisticFieldName: "Average_depth",
      statisticType: "avg",
    };

    const magMax = {
      onStatisticField: "mag",
      outStatisticFieldName: "Max_magnitude",
      statisticType: "max",
    };

    const magAvg = {
      onStatisticField: "mag",
      outStatisticFieldName: "Average_magnitude",
      statisticType: "avg",
    };

    const magMin = {
      onStatisticField: "mag",
      outStatisticFieldName: "Min_magnitude",
      statisticType: "min",
    };

    const tremorCount = {
      onStatisticField: "mag",
      outStatisticFieldName: "tremor_count",
      statisticType: "count",
    };

    const statsFields = {
      Max_magnitude: "Max Count",
      Average_magnitude: "Average Count",
      Min_magnitude: "Min Count",
      // Average_depth: "Average Depth",
    };

    // add a legend for the earthquakes layer
    const legendExpand = new Expand({
      collapsedIconClass: "esri-icon-collapse",
      expandIconClass: "esri-icon-expand",
      expandTooltip: "Legend",
      view: view,
      content: new Legend({
        view: view,
      }),
      expanded: false,
    });
    view.ui.add(legendExpand, "top-left");

    const statsDiv = document.getElementById("statsDiv");
    const infoDiv = document.getElementById("infoDiv");
    const infoDivExpand = new Expand({
      collapsedIconClass: "esri-icon-collapse",
      expandIconClass: "esri-icon-expand",
      expandTooltip: "Expand Migration Info",
      view: view,
      content: infoDiv,
      expanded: true,
    });
    view.ui.add(infoDivExpand, "top-right");

    view.on("click", function (event) {
      view.hitTest(event).then(function (response) {
        const values = document
          .querySelector(".esri-feature-fields__field-data")
          .innerHTML.split(",");
        drawLineFromMap(birdData, values[0], values[1]);
      });
    });
  }
});
