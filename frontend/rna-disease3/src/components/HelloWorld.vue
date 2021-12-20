<template>
  <svg width="800" height="600" viewBox="0,0,800,600">
    <g>
      <g>
        <!-- 渲染节点链接图 -->
        <circle
          v-for="node in showNodes"
          :key="node.id"
          :cx="x(node.x)"
          :cy="y(node.y)"
          r="1"
          :fill="colors[node.category]"
          class="point"
        />
        <line
          v-for="edge in showEdges"
          stroke-width="2"
          stroke="#999"
          :key="edge.source.id + '-' + edge.target.id"
          :x1="x(edge.source.x)"
          :y1="y(edge.source.y)"
          :x2="x(edge.target.x)"
          :y2="y(edge.target.y)"
        ></line>
      </g>
      <g v-for="group in lodash.keys(paths)" :key="group">
        <!-- 渲染密度图 -->
        <path
          opacity="0.1"
          v-for="p in paths[group]"
          :key="p"
          :d="d3.geoPath()(p)"
          :fill="colors[group]"
        ></path>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from "d3";
import nodeLinks from "./nodeLinks.json";
import forceWorker from "./force.worker.js";
import lodash from "lodash";

import "animate.css";
import svgPanZoom from "svg-pan-zoom";

const width = 800;
const height = 600;

const RANGE = [-500, 500];

function reverseTransform(transform,axis,value){
  const k=transform.k;
  const t=transform[axis];
  return (value-t)/k;
}

const vm = {
  data: () => ({
    nodes: nodeLinks.nodes,
    edges: nodeLinks.edges,
    showNodes: [],
    showEdges: [],
    x: d3.scaleLinear().domain(RANGE).range([0, width]),
    y: d3.scaleLinear().domain(RANGE).range([0, height]),
    rx: d3.scaleLinear().domain([0, width]).range(RANGE),
    ry: d3.scaleLinear().domain([0, height]).range(RANGE),
    d3,
    lodash,
    paths: [],
    colors: {
      0: "steelblue",
      1: "green",
      2: "orange",
    },
    transform: {
      k: 1,
      x: 0,
      y: 0,
    },
  }),
  created() {
    let worker = new forceWorker();
    worker.onmessage = (e) => {
      switch (e.data.type) {
        case "tick":
          this.paths = e.data.contours;
          break;
        case "end":
          this.showNodes = e.data.nodes;
          this.showEdges = e.data.edges;
          break;
      }
    };
    worker.postMessage({
      nodes: nodeLinks.nodes,
      edges: nodeLinks.edges,
      range: RANGE,
      height,
      width,
    });
  },
  mounted() {
    svgPanZoom(this.$el, {
      onZoom: (scale) => {
        this.transform.k = scale;
      },
      onPan: ({ x, y }) => {
        this.transform.x = x;
        this.transform.y = y;
      },
    });
  },
  methods: {
    zoomed(e) {
      console.log(e);
    },
  },
  computed: {
    viewBox(){
      return [
        reverseTransform(this.transform,'x',0),
        reverseTransform(this.transform,'y',0),
        reverseTransform(this.transform,'x',this.width),
        reverseTransform(this.transform,'y',this.height),
      ]
    }

  },
  watch: {
    transform: {
      handler: function () {
        console.log(this.transform);
      },
      deep: true,
    },
  },
};

export default vm;
</script>

<style scoped>
</style>