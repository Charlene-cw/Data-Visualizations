function FoodSafety() {
  this.name = 'Food Safety Perceptions: 2023 VS 2025';
  this.id = 'food-safety-perceptions';
  this.title = 'Food safety perceptions of British shoppers in UK';
  this.loaded = false;

  // gallery when a visualisation is added
  this.preload = function () {
    const self = this;
    this.data = loadTable(
      './data/food-safety-perceptions/FoodSafetyPerceptions_2023vs2025.csv', 'csv', 'header',

      function (table) {
        self.loaded = true;
        self.year2023 = {};
        self.year2025 = {};

        for (let i = 0; i < table.getRowCount(); i++) {
          const year = parseFloat(table.getString(i, 'Year'));
          const safe = parseFloat(table.getString(i, 'Believe food produced in UK is safe'));
          const goodQ = parseFloat(table.getString(i, 'Believe food produced in UK is of good quality'));
          const traceability = parseFloat(table.getString(i, 'Confident in traceability of UK food suppy chain'));

          const record = {
            safe: safe,
            goodQ: goodQ,
            traceability: traceability
          };

          if (year === 2023) {
            self.year2023 = record;
          } else if (year === 2025) {
            self.year2025 = record;
          }
        }
      });
  };

  this.setup = function () {
    const self = this

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '6px 10px')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('font-size', '15px')
      .style('pointer-events', 'none')
      .style('visibility', 'hidden');

    const container = d3.select('#food-safety')
      .append('div')
      .attr('id', 'food-safety-rings')
      .style('display', 'flex')
      .style('gap', '40px')
      .style('margin', '30px')
      .style('justify-content', 'center');

    self.select = container

    const metrics = [
      { name: 'Believe food produced in UK is safe', value2023: self.year2023.safe, value2025: self.year2025.safe },
      { name: 'Believe food produced in UK is of good quality', value2023: self.year2023.goodQ, value2025: self.year2025.goodQ },
      { name: 'Confident in traceability of UK food suppy chain', value2023: self.year2023.traceability, value2025: self.year2025.traceability }
    ];

    //Circle diagram for each condition
    metrics.forEach(metric => {
      const svg = container.append('svg')
        .attr('width', 350)
        .attr('height', 350);

      const centerX = 120;
      const centerY = 140;
      const radius = 70;
      const strokeWidth = 15;

      const arc = (value, r, color) => {
        const angle = Math.max(0.01, (value / 100) * 2 * Math.PI);
        const x = centerX + r * Math.sin(angle);
        const y = centerY - r * Math.cos(angle);
        return `M ${centerX} ${centerY - r}
              A ${r} ${r} 0 ${value > 50 ? 1 : 0} 1 ${x} ${y}`;
      };

      // Background circle
      svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius + strokeWidth + 2)
        .attr('fill', 'none')
        .attr('stroke', '#eee')
        .attr('stroke-width', strokeWidth);

      // 2023 arc
      svg.append('path')
        .attr('d', arc(metric.value2023, radius, '#ccc'))
        .attr('stroke', '#ccc')
        .attr('stroke-width', strokeWidth)
        .attr('fill', 'none');

      // 2025 arc
      svg.append('path')
        .attr('d', arc(metric.value2025, radius + strokeWidth + 2, '#007acc'))
        .attr('stroke', '#007acc')
        .attr('stroke-width', strokeWidth)
        .attr('fill', 'none');

      //Names of chart
      svg.append('foreignObject')
        .attr('x', centerX - 100)
        .attr('y', centerY + radius + 30)
        .attr('width', 200)
        .attr('height', 60)
        .append('xhtml:div')
        .style('font-size', '16px')
        .style('text-align', 'center')
        .style('line-height', '1.2em')
        .style('color', '#333')
        .html(metric.name);

      //Percentages
      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY + 25 + radius + 65)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text(`2023: ${metric.value2023}%  |  2025: ${metric.value2025}%`);

      //Hover for 2023 arc
      svg.append('path')
        .attr('d', arc(metric.value2023, radius, '#ccc'))
        .attr('stroke', '#ccc')
        .attr('stroke-width', strokeWidth)
        .attr('fill', 'none')
        .on('mouseover', (event) => {
          tooltip.style('visibility', 'visible')
            .html(`<strong>2023</strong><br>${metric.name}<br>${metric.value2023}%`);
        })
        .on('mousemove', event => {
          tooltip.style('top', `${event.pageY + 12}px`)
            .style('left', `${event.pageX + 12}px`);
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden');
        });

      //Hover for 2025 arc
      svg.append('path')
        .attr('d', arc(metric.value2025, radius + strokeWidth + 2, '#007acc'))
        .attr('stroke', '#007acc')
        .attr('stroke-width', strokeWidth)
        .attr('fill', 'none')
        .on('mouseover', (event) => {
          tooltip.style('visibility', 'visible')
            .html(`<strong>2025</strong><br>${metric.name}<br>${metric.value2025}%`);
        })
        .on('mousemove', event => {
          tooltip.style('top', `${event.pageY + 12}px`)
            .style('left', `${event.pageX + 12}px`);
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden');
        });

    });

    //legend
    const legend = d3.select('#food-safety')
      .append('div')
      .attr('class', 'legend')
      .style('display', 'flex')
      .style('justify-content', 'flex-start')
      .style('gap', '30px')
      .style('margin-left', '70px');

    const legendItems = [
      { label: '2023', color: '#ccc' },
      { label: '2025', color: '#007acc' }
    ];

    legendItems.forEach(item => {
      legend.append('div')
        .style('display', 'flex')
        .style('font-size', '16px')
        .html(`
          <span style="display:inline-block;width:14px;height:14px;background-color:${item.color};margin-right:8px;border-radius:3px;"></span>
          ${item.label}
        `);
    });

  }

  this.destroy = function () {
    this.select.remove();
    d3.select('#food-safety').html(''); // Clean up
    d3.select('.tooltip').remove();
  };

  this.draw = function () {
  };
}