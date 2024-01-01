function bubbleChart() {
  var width = 1400;
  var height = 800;
  var tooltip = floatingTooltip('gates_tooltip', 240);
  var center = { x: width / 2, y: height / 2 };
  var forceStrength = 0.03;
  var svg = null;
  var bubbles = null;
  var nodes = [];
  var agentCenters = {};
  var legendWidth = width * 0.2;
  var legendHeight = height * 0.2;
  var i = 0;

  var zoom = d3.zoom()
    .scaleExtent([0.5, 10]) // Set the minimum and maximum zoom scale
    .on('zoom', zoomed); // Specify the zoom event handler
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  var simulation = d3.forceSimulation()
    .velocityDecay(0.3)
    .alphaDecay(0)
    .force('charge', d3.forceManyBody().strength(charge))
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .on('tick', ticked);

  simulation.stop();

function createNodes(rawData) {
  var agentTypes = {}; // Keep track of agent types
  var instanceCounts = {}; // Count instances of each agent type

  rawData.forEach(function (d) {
    var agentType = d.typeOfAgent;

    // Increment instance count for each agent type
    if (instanceCounts.hasOwnProperty(agentType)) {
      instanceCounts[agentType]++;
    } else {
      instanceCounts[agentType] = 1;
    }
  });

  var radiusScale = d3.scaleSqrt()
    .domain(d3.extent(Object.values(instanceCounts)))
    .range([25, 12]); // Adjust the range of the radius scale as desired


  var myNodes = rawData.map(function (d, i) {
    var agentType = d.typeOfAgent;
    // If agent type is encountered for the first time, assign a new color and position
    if (!agentTypes.hasOwnProperty(agentType)) {
      var newPosition = generatePosition();

      while (calculateDistance(newPosition, agentCenters) < 150) {
        newPosition = generatePosition();
      }
      agentTypes[agentType] = getColorTemp()
      //agentTypes[agentType] = getColor(agentType);
      agentCenters[agentType] = newPosition;
    }

    return {
      id: d.id,
      radius: radiusScale(instanceCounts[agentType]),
      name: d.nameOfAgent,
      type: agentType,
      color: agentTypes[agentType],
      x: agentCenters[agentType].x,
      y: agentCenters[agentType].y,
      blocked: d.isBlocked,
    };
  });

    agentTypes['blockedAgent'] = 'red';

    var legend = d3.select('#legend')
      .append('svg')
      .attr('class', 'legend')
      .attr('width', legendWidth)
      .attr('height', legendHeight);

    var legendItems = legend.selectAll('g')
      .data(Object.entries(agentTypes))
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', function (d, i) {
        var x = 0;
        var y = i * (legendHeight / Object.keys(agentTypes).length);
        return 'translate(' + x + ',' + y + ')';
      });

    legendItems.append('circle')
      .attr('class', 'legend-circle')
      .attr('cx', 8)
      .attr('cy', legendHeight / (2 * Object.keys(agentTypes).length))
      .attr('r', 6)
      .attr('fill', function (d) { return d[1]; });

    legendItems.append('text')
      .attr('class', 'legend-text')
      .attr('x', 20)
      .attr('y', legendHeight / (2 * Object.keys(agentTypes).length) + 5)
      .text(function (d) { return d[0]; });

    return myNodes;
  }

function shuffleArray(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function generatePosition() {
  return {
    x: d3.randomUniform(175, width - 175)(),
    y: d3.randomUniform(175, height - 175)(),
  };
}

function calculateDistance(position, agentCenters) {
  var distances = Object.values(agentCenters).map(function (center) {
    var dx = position.x - center.x;
    var dy = position.y - center.y;
    return Math.sqrt(dx * dx + dy * dy);
  });
  return d3.min(distances);
}

var chart = function chart(selector, rawData) {
  var nodes = createNodes(rawData);
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(zoom); // Apply the zoom behavior to the SVG

    var container = svg.append('g');

    // Append the clipping path to the SVG
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-area')
      .append('rect')
      .attr('width', width)
      .attr('height', height);


    bubbles = container.selectAll('.bubble')
  .data(nodes)
  .enter()
  .append('a') // Add an anchor element for the link
  .attr('href', function(d) { return d.id; })
  .append('circle')
  .classed('bubble', true)
  .attr('r', function (d) { return d.radius; })
  .attr('fill', function (d) {return d.blocked == "true" ? "red" : d.color;})
  .attr('stroke', function (d) { return d3.rgb(d.color).darker(); })
  .attr('stroke-width', 2)
  .on('mouseover', showDetail)
  .on('mouseout', hideDetail);

    simulation.nodes(nodes);

    groupBubbles();
  };

  function ticked() {
  // Adjust the alpha decay to control the movement of the bubbles
  simulation.alphaDecay(0.02);

  // Add a random displacement to the x and y positions of the bubbles
  bubbles.each(function(d) {
    // Calculate the distance between the current position and the initial position
    var dx = d.x - d.x;
    var dy = d.y - d.y;

    // Apply a force to attract the bubbles towards their initial positions
    d.x -= dx * 0.01;
    d.y -= dy * 0.01;

    // Add a random displacement to the x and y positions
    d.x += (Math.random() / 4 - 0.1);
    d.y += (Math.random() / 4 - 0.1);
  });

  bubbles
    .transition()
    .duration(1500) // Set the transition duration to control the smoothness
    .ease(d3.easePolyOut.exponent(3)) // Use a different easing function for smoother transition
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; })

  // Restart the simulation to keep it running indefinitely
  simulation.alpha(1).restart();
}

  function groupBubbles() {
  simulation.force('x', d3.forceX().strength(forceStrength).x(function(d) {
    return agentCenters[d.type].x;
  }));

  simulation.force('y', d3.forceY().strength(forceStrength).y(function(d) {
    return agentCenters[d.type].y;
  }));

  simulation.alpha(1).restart();
}

  function showDetail(d) {
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Name: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Type: </span><span class="value">' +
                  d.type +
                  '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  function zoomed() {
    // Update the transform of the container group based on the zoom event
    svg.select('g')
      .attr('transform', d3.event.transform);
  }

  function hideDetail(d) {
    d3.select(this).attr('stroke', d3.rgb(d.color).darker());
    tooltip.hideTooltip();
  }
  return chart;
}

var myBubbleChart = bubbleChart();

function display(error, data) {
  if (error) {
    console.log(error);
  }
  myBubbleChart('#vis', data);
}

function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      d3.selectAll('.button').classed('active', false);
      var button = d3.select(this);
      button.classed('active', true);
      var buttonId = button.attr('id');
      myBubbleChart.toggleDisplay(buttonId);
    });
}

var i = 0;
function getColorTemp() {
  console.log(i)
  var colorRange = [
    "#D3A1FF", // Misty Lilac
    "#FFD6B1", // Hushed Peach
    "#C4FFCD", // Pale Mint
    "#B2C6E0", // Dusty Sky Blue
    "#FBBFCC", // Blush Pink
    "#FDEEB2", // Pale Lemon
    "#A8D8CB", // Seafoam Green
    "#FFEFD5", // Papaya Whip
    "#AFFFD5", // Mint Cream
    "#C7E2E3", // Powder Blue
    "#F3C4E8", // Orchid Pink
    "#FFEE93", // Canary Yellow
    "#BBE0E3", // Baby Blue
   ];
  return colorRange[i++];
}


function getHashCode(str) {
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for(var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

function getColor(agentType) {
  var hash = getHashCode(agentType);
  console.log(hash)
  // Define an array of colors for a broader range of options
  var colorRange = [
    "#D3A1FF", // Misty Lilac
    "#FFD6B1", // Hushed Peach
    "#C4FFCD", // Pale Mint
    "#B2C6E0", // Dusty Sky Blue
    "#FBBFCC", // Blush Pink
    "#FDEEB2", // Pale Lemon
    "#A8D8CB", // Seafoam Green
    "#FFEFD5", // Papaya Whip
    "#AFFFD5", // Mint Cream
    "#C7E2E3", // Powder Blue
    "#F3C4E8", // Orchid Pink
    "#FFEE93", // Canary Yellow
    "#BBE0E3", // Baby Blue
   ];

  // Map the hash value to an index within the color range array
  var index = d3.scaleLinear()
    .domain([-2147483648, 2147483647]) // Range of possible hash values
    .range([0, colorRange.length - 1])(hash);

  // Retrieve the color based on the index
  var color = colorRange[Math.round(index)];

  return color;
}

d3.json('data/agents.json', display);
setupButtons();
