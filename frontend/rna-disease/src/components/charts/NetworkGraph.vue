<template>
  <div class="network_graph" style="border: 1px solid"></div>
</template>

<script>
import * as d3 from "d3";
import _ from "lodash";
import groupCenter from "../../utils/groupCenter";
import networkWorker from "./network.worker";

let svg = null;
let g = null;
let contours = null;
let link = null;
let node = null;
let simulation = null;

const width = 800;
const height = 600;

const RANGE = [-500, 500];
const x = d3.scaleLinear().domain(RANGE).range([0, width]);
const y = d3.scaleLinear().domain(RANGE).range([0, height]);
const rx = d3.scaleLinear().domain([0, width]).range(RANGE);
const ry = d3.scaleLinear().domain([0, height]).range(RANGE);
const quadTree = d3
  .quadtree()
  .x((d) => d.x)
  .y((d) => d.y);

let density = null;

var viewBox = [0, 0, width, height];

function zoomed({transform}) {
  g.attr("transform", transform);
  const vx0 = rx(transform.invertX(0));
  const vy0 = ry(transform.invertY(0));
  const vx1 = rx(transform.invertX(width));
  const vy1 = ry(transform.invertY(height));
  viewBox = [vx0, vy0, vx1, vy1];
  console.log(viewBox);
}

function initSimulation(nodes, edges) {
  // simulation && simulation.stop();
  // simulation = d3
  //   .forceSimulation(nodes)
  //   .force(
  //     "link",
  //     d3
  //       .forceLink(edges)
  //       .id((d) => d.id)
  //   )
  //   .force("charge", d3.forceManyBody())
  //   .force("center", groupCenter(
  //     {
  //       0:{x:0,y:150},
  //       1:{x:-300,y:-150},
  //       2:{x:300,y:-150},
  //     }
  //   ))
  //   // .force("center",d3.forceCenter())
  //   .force("x", d3.forceX())
  //   .force("y", d3.forceY())
  //   .on("tick", ticked);
  simulation && simulation.terminate();
  simulation = new networkWorker();
  simulation.postMessage({
    nodes,
    edges,
  });
  simulation.onmessage = function (e) {
    // console.log(e.data);
    // nodes=e.data.nodes;
    // edges=e.data.edges;
    // ticked();
    // if(e.data.type=="end"){
    //   simulation.terminate();
    //   console.log("end");
    // }
    // console.log(Date.now(), "tick");
    switch (e.data.type) {
      case "end":
        simulation.terminate();
        console.log("end");
        break;
      case "tick":
        updateContours(e.data.contours);
        break;
    }
  };



  function updateContours(conrours) {
    _.mapValues(density, (den, i) =>
      den
        .selectAll("path")
        .data(conrours[i])
        .join("path")
        .attr("stroke-width", 0)
        .attr("fill", () => ["green", "steelblue", "orange"][i])
        .attr("opacity", 0.1)
        .attr("d", d3.geoPath())
    );
  }

  // link = g
  //   .append("g")
  //   .attr("stroke", "#999")
  //   .attr("stroke-opacity", 0.6)
  //   .attr("stroke-width", 1.5)
  //   .attr("stroke-linecap", "round")
  //   .attr("class", "link")
  //   .selectAll("line")
  //   .data(edges)
  //   .join("line");

  // node = g
  //   .append("g")

  //   .attr("stroke", "#fff")
  //   .attr("stroke-opacity", 1.0)
  //   .attr("stroke-width", 1.5)
  //   .attr("class", "node")
  //   .selectAll("circle")
  //   .data(nodes)
  //   .join("circle")
  //   .attr("r", 2)
  //   .attr("fill", (n) => {
  //     return ["green", "steelblue", "orange"][n.category];
  //   })
  //   .call(drag(simulation));

  density = _.fromPairs(
    [0, 1, 2].map((d) => [
      d,
      g
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round"),
    ])
  );

  // density = [1, 2, 3].map(() =>
  //   g
  //     .append("g")
  //     .attr("fill", "none")
  //     .attr("stroke", "steelblue")
  //     .attr("stroke-linejoin", "round")
  // );
  function ticked() {
    // link
    //   .attr("x1", function (d) {
    //     return x(d.source.x);
    //   })
    //   .attr("y1", function (d) {
    //     return y(d.source.y);
    //   })
    //   .attr("x2", function (d) {
    //     return x(d.target.x);
    //   })
    //   .attr("y2", function (d) {
    //     return y(d.target.y);
    //   });

    // node
    //   .attr("cx", function (d) {
    //     return x(d.x);
    //   })
    //   .attr("cy", function (d) {
    //     return y(d.y);
    //   });

    const classes = _.values(_.groupBy(nodes, (n) => n.category));
    let densityCalc = d3
      .contourDensity()
      .x((d) => x(d.x))
      .y((d) => y(d.y))
      .cellSize(10)
      .bandwidth(30)
      .thresholds([0.05, 0.1, 0.2, 0.3]);
    contours = classes.map((v, i) => densityCalc(v));

    density.forEach((den, i) => {
      den
        .selectAll("path")
        .data(contours[i])
        .join("path")
        .attr("stroke-width", 0)
        .attr("fill", () => ["green", "steelblue", "orange"][i])
        .attr("opacity", 0.1)
        .attr("d", d3.geoPath());
    });
    // contours = d3
    //   .contourDensity()
    //   .x((d) => x(d.x))
    //   .y((d) => y(d.y))
    //   // .size([width, height])
    //   .cellSize(10)
    //   .bandwidth(30)
    //   .thresholds(30)(nodes);
    // density
    //   .selectAll("path")
    //   .data(contours)
    //   .join("path")
    //   .attr("stroke-width", (d, i) => (i % 5 ? 0.25 : 1))
    //   .attr("d", d3.geoPath());
  }
  return simulation;
}

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

let vm = {
  mounted() {
    svg = d3
      .select(this.$el)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", [0, 0, this.width, this.height]);
    g = svg.append("g");
    const zoom = d3.zoom().on("zoom", zoomed);
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);
    this.rawNodes = _.cloneDeep(this.nodes);
    this.rawEdges = _.cloneDeep(this.edges);
    this.nodesShow = [];
    this.linksShow = [];
    initSimulation(this.rawNodes, this.rawEdges);
  },
  props: {
    nodes: Array,
    edges: Array,
  },
  data: () => ({
    width,
    height,
    zoomT: d3.zoomIdentity,
    nodesShow: [],
    linksShow: [],
    rawNodes: [],
    rawEdges: [],
  }),
  methods: {
    zoomed({ transform }) {
      this.zoomT = transform;
      g.attr("transform", transform);
    },
  },
  watch: {
    nodes() {
      this.rawNodes = _.deepClone(this.nodes);
      initSimulation(this.nodes, this.edges);
      quadTree.removeAll();
      quadTree.addAll(this.nodes);
    },
    edges() {
      this.rawEdges = _.deepClone(this.edges);
      initSimulation(this.nodes, this.edges);
    },
    nodesShow(newVal, oldVal) {
      oldVal;
      newVal;
    },
  },
  computed: {
    viewBox() {
      const vx0 = rx(this.zoomT.invertX(0));
      const vy0 = ry(this.zoomT.invertY(0));
      const vx1 = rx(this.zoomT.invertX(this.width));
      const vy1 = ry(this.zoomT.invertY(this.height));
      return [vx0, vy0, vx1, vy1];
    },
  },
};
export default vm;
</script>