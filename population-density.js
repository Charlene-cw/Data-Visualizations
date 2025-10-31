function PopulationDensity() {
  this.name = 'Population density: 2021';
  this.id = 'population-density';
  this.title = 'Population density in East Asia';
  this.loaded = false;

  // gallery when a visualisation is added
  this.preload = function () {
    const self = this;
    this.data = loadTable(
      './data/population-density/East_Asia_population_density_2021.csv', 'csv', 'header',

      function (table) {
        self.loaded = true;
        self.densityData = {};
        for (let i = 0; i < table.getRowCount(); i++) {
          const country = table.getString(i, 'Country Name');
          const density = table.getNum(i, 'Population density');
          self.densityData[country] = density;
        }
      });
  };

  this.setup = function () {
    const self = this;
    // Load the SVG and draw it inside the sketch
    d3.xml('./data/population-density/east_asia_map.svg').then(data => {
      const svgNode = data.documentElement;

      // Append the SVG to the container
      d3.select('#heat-map')
        .node()
        .appendChild(svgNode);

      const svg = d3.select('#heat-map svg');

      const tooltip = d3.select('#heat-map')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('padding', '6px 10px')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('box-shadow', '0 2px 6px rgba(0,0,0,0.2)')
        .style('pointer-events', 'none')
        .style('font-size', '15px')
        .style('color', '#333')
        .style('visibility', 'hidden');

      self.select = svg;
      const mapGroup = svg.select('g');
      //Initial positioning 
      const initialTransform = d3.zoomIdentity
        .translate(-90, -10)
        .scale(0.6);
      mapGroup.attr('transform', initialTransform);
      //Add zoom behavior
      svg.call(
        d3.zoom()
          .on('zoom', function (event) {
            mapGroup.attr('transform', event.transform);
          })
      ).call(
        d3.zoom().transform, initialTransform
      );

      // Extract density values for scale
      const densities = Object.values(self.densityData);
      const colorScale = d3.scaleSequential()
        .domain([d3.min(densities), d3.max(densities)])
        .interpolator(d3.interpolateOrRd);

      // Apply fill based on density
      svg.selectAll('path').each((d, i, nodes) => {
        const path = d3.select(nodes[i]);
        const country = path.attr('id');

        if (!country) {
          console.warn(`Skipping path with no ID`);
          return;
        }

        const density = self.densityData[country];
        const fillColor = density !== undefined ? colorScale(density) : '#eee'; // fallback color

        if (fillColor === '#eee') {
          console.warn(`No density data for ${country}`);
        }

        path
          .style('fill', fillColor)
          .attr('class', 'region')
          .on('mouseover', (event) => {
            const [x, y] = d3.pointer(event);
            tooltip
              .style('left', `${x + 20}px`)
              .style('top', `${y}px`)
              .style('visibility', 'visible')
              .html(`<strong>${country}</strong><br>${density !== undefined ? density : 'No data'} people/km²`);
          })
          .on('mousemove', (event) => {
            tooltip
              .style('left', `${event.pageX + 20}px`)
              .style('top', `${event.pageY}px`);
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden');
          });
      });
    });

    //Legend
    const densities = Object.values(self.densityData);
    const minDensity = d3.min(densities);
    const maxDensity = d3.max(densities);
    const colorScale = d3.scaleSequential()
      .domain([minDensity, maxDensity])
      .interpolator(d3.interpolateOrRd);

    const legendWrapper = d3.select('#heat-map')
      .append('div')
      .attr('class', 'legend')
      .style('display', 'legend-wrapper')
      .style('display', 'flex')
      .style('align-items', 'flex-start')
      .style('gap', '40px')
      .style('margin-left', '45px')
      .style('margin-top', '20px')
      .style('font-size', '14px')
      .style('padding-bottom', '4px');

    const legend = legendWrapper
      .append('div')
      .attr('class', 'legend')

    legend.append('div')
      .style('width', '220px')
      .style('height', '13px')
      .style('background', 'linear-gradient(to right, ' +
        d3.range(0, 1.01, 0.1).map(t => colorScale(d3.interpolateNumber(minDensity, maxDensity)(t))).join(', ') +
        ')')
      .style('margin-bottom', '5px');

    legend.append('div')
      .style('display', 'flex')
      .style('justify-content', 'space-between')
      .style('width', '200px')
      .style('gap', '65px')
      .html(`<span>${minDensity} people/km²</span><span>${maxDensity} people/km²</span>`);

    //instructions
    legendWrapper.append('div')
      .attr('class', 'map-instructions')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('font-size', '13px')
      .style('color', '#333')
      .style('box-shadow', '0 2px 6px rgba(0,0,0,0.2)')
      .html(`
        <strong>Map Instructions</strong><br>
        🖱️ Zoom and pan with your mouse.<br>
        📍 Move your mouse to a country to see its population density.
      `);
  };

  this.destroy = function () {
    this.select.remove();
    d3.select('#heat-map').html(''); // Clean up
  };

  this.draw = function () {
  };
}
