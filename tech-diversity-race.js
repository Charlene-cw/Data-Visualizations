function TechDiversityRace() {

  // Name for the visualisation to appear in the menu bar
  this.name = 'Tech Diversity: Race';

  this.id = 'tech-diversity-race';
  this.loaded = false;

  // Preload the data
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/race-2018.csv', 'csv', 'header',
      // Callback function to set the value
      function (table) {
        self.loaded = true;
      });
  };

  this.setup = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Create a select DOM element.
    this.select = createSelect();
    this.select.position(350, 40);

    // Fill the options with all company names.
    var companies = this.data.columns;
    // First entry is empty.
    for (let i = 1; i < companies.length; i++) {
      this.select.option(companies[i]);
    }

    this.select.changed(() => this.updateChart());  // redraw on change  

    // Create the D3 SVG container
    d3.select('#donut-chart').html(''); // Clear
    //const 
    this.svg = d3.select('#donut-chart')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500)
      .append('g')
      .attr('transform', 'translate(250,250)');

    const labels = this.data.getColumn(0).map(l => l.trim());
    this.color = d3.scaleOrdinal()
      .domain(labels)
      .range(['blue', 'red', 'green', 'pink', 'purple', 'yellow']);

    // Tooltip div (hidden by default)
    this.tooltip = d3.select('#donut-chart')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('padding', '6px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    this.updateChart();

  };

  this.destroy = function () {
    this.select.remove();
    d3.select('#donut-chart').html(''); // Clean up
  };

  this.draw = function () {
    //empty function
  };

  this.updateChart = function () {
    if (!this.loaded) return;

    const company = this.select.value();
    let col = stringsToNumbers(this.data.getColumn(company));

    let labels = this.data.getColumn(0).map(l => l.trim());
    const data = labels.map((label, i) => ({
      label: label,
      value: col[i]
    }));

    const radius = 200;
    const innerRadius = 100;

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 20); // bigger radius on hover

    let self = this;

    const arcs = this.svg.selectAll('path')
      .data(pie(data));

    // EXIT
    arcs.exit().remove();

    // UPDATE
    arcs.transition()
      .duration(500)
      .attr('d', arc)
      .attr('fill', d => self.color(d.data.label));

    // ENTER
    arcs.enter()
      .append('path')
      .merge(arcs)
      .attr('fill', d => self.color(d.data.label))
      .attr('d', arc)
      .attr('aria-label', d => `${d.data.label}: ${d.data.value}%`)
      .attr('tabindex', 0)

      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .raise()
          .transition()
          .duration(200)
          .attr('d', arcHover);

        self.tooltip
          .style('opacity', 1)
          .html(`<strong>${d.data.label}</strong><br>${d.data.value}%`);
      })
      .on('mousemove', function (event) {
        self.tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 25) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', function (d) { return arc(d); });

        self.tooltip.style('opacity', 0);
      })

      .merge(arcs)  // << Merge enter and update here
      .transition()
      .duration(500)
      .attr('d', arc)
      .attr('fill', d => self.color(d.data.label));

    // Center text
    this.svg.selectAll('.center-text').remove();

    this.svg.append('text')
      .attr('class', 'center-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .style('font-size', '16px')
      .text('Diversity');

    this.svg.append('text')
      .attr('class', 'center-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', '12px')
      .text(company);

    // Legend
    d3.select('#donut-chart .legend').remove(); // Clear old legend

    const legend = d3.select('#donut-chart')
      .append('div')
      .attr('class', 'legend');

    data.forEach(d => {
      legend.append('div')
        .style('margin', '5px')
        .html(`<span style="display:inline-block;width:12px;height:12px;background-color:${self.color(d.label)};margin-right:5px;"></span>${d.label}: ${d.value}%`);
    });
  };
}
