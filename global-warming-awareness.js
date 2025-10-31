function GWawareness() {
  this.name = "Americans' Global warming awareness";
  this.id = 'global-warming-awareness';
  this.title = "Americans' Global warming awareness";
  this.loaded = false;

  // gallery when a visualisation is added
  this.preload = function () {
    const self = this;
    this.data = loadTable(
      './data/global-warming-awareness/GW_awareness.csv', 'csv', 'header',

      function (table) {
        self.loaded = true;
        self.gwaData = {};
        for (let i = 0; i < table.getRowCount(); i++) {
          const ageGroup = table.getString(i, 'Age group');
          const percentage = parseFloat(table.getString(i, 'Global warming awareness'));
          self.gwaData[ageGroup] = percentage;
        }
      });
  };

  this.setup = function () {
    const container = d3.select('#GW-awareness')
      .append('div')
      .attr('id', 'gw-awareness-waffles')
      .style('display', 'flex')
      .style('gap', '60px')
      .style('margin', '30px')
      .style('justify-content', 'center');

    this.select = container;

    const squareSize = 20;
    const gap = 3;
    const cols = 10;
    const rows = 10;
    const chartWidth = cols * (squareSize + gap);
    const chartHeight = rows * (squareSize + gap);
    const margin = { top: 70, right: 50, bottom: 70, left: 50 };

    const ageGroups = Object.keys(this.gwaData);
    const colorScale = d3.scaleOrdinal()
      .domain(ageGroups)
      .range(['#69b3a2', '#d62728']);
      
    //waffle chart for each age group 
    ageGroups.forEach(age => {
      const percentage = this.gwaData[age];
      const filledCount = Math.round(percentage);
      const fillColor = colorScale(age);

      const svg = container.append('svg')
        .attr('width', chartWidth + margin.left + margin.right)
        .attr('height', chartHeight + margin.top + margin.bottom);

      const group = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      group.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', 255)
        .attr('text-anchor', 'middle')
        .attr('font-size', '17px')
        .text(`Age ${age}: ${percentage}% aware`);

      for (let i = 0; i < 100; i++) {
        const x = (i % cols) * (squareSize + gap);
        const y = Math.floor(i / cols) * (squareSize + gap);

        group.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', squareSize)
          .attr('height', squareSize)
          .attr('fill', i < filledCount ? fillColor : '#eee');
      }
    });

  };


  this.destroy = function () {
    this.select.remove();
    d3.select('#GW-awareness').html(''); // Clean up
  };


  this.draw = function () {
  };
}
