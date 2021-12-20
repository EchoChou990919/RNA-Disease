<template>
  <svg
    width="800"
    height="600"
    viewBox="0,0,800,600"
    ref="el"
    @mousemove="pointermove"
    @mouseout="pointerout"
    @dblclick="onclick"
  >
    <filter x="0" y="0" width="1" height="1" id="solid">
      <feFlood flood-color="#EEE" />
      <feComposite in="SourceGraphic" />
    </filter>
    <g>
      <g>
        <g :style="{filter:selectedNodeIds.locked?'opacity(0.2)':'none'}">
          <transition-group name="fade" tag="g">
            <!-- 节点 -->
            <path
              v-for="node in showNodes"
              :key="node.id"
              :transform="`translate(${x(node.x)},${y(node.y)})`"
              :d="
                d3.symbol(
                  symbol[node.category],
                  (3 + node.degree / 10) / transform.k
                )()
              "
              :fill="node.selected ? 'red' : colors[node.category]"
              class="point"
            ></path>
          </transition-group>
          <transition-group name="fade" tag="g">
            <!-- 边 -->
            <line
              v-for="edge in showEdges"
              :stroke-width="2 / transform.k"
              :stroke="edge.selected ? 'red' : '#999'"
              :key="edge.source.id + '-' + edge.target.id"
              :x1="x(edge.source.x)"
              :y1="y(edge.source.y)"
              :x2="x(edge.target.x)"
              :y2="y(edge.target.y)"
              opacity="0.1"
            ></line>
          </transition-group>
        </g>
        <transition-group name="fade" tag="g">
          <!-- 高亮的边 -->
          <line
            v-for="edge in highlightLines"
            :stroke-width="1 / transform.k"
            :stroke="
              selectedNodeIds.mouseSelected == edge.source.id
                ? colors[edge.target_type]
                : colors[edge.source_type]
            "
            :key="edge.source.id + '-' + edge.target.id"
            :x1="x(edge.source.x)"
            :y1="y(edge.source.y)"
            :x2="x(edge.target.x)"
            :y2="y(edge.target.y)"
            :opacity="edge.value"
            :stroke-dasharray="
              edge.source_type == edge.target_type ? '1' : 'none'
            "
          ></line>
        </transition-group>
        <text
          :x="x(node.x)"
          :y="y(node.y)"
          filter="url(#solid)"
          v-for="node in selectedNodes"
          :key="node.id"
          :fill="colors[node.category]"
          :font-size="20 / transform.k"
        >
          {{ node.name }}
        </text>
      </g>
      <g :style="{filter:selectedNodeIds.locked?'opacity(0.5)':'none'}">
        <!-- 渲染密度图 -->
        <g v-for="group in lodash.keys(paths)" :key="group">
          <path
            opacity="0.1"
            v-for="p in paths[group]"
            :key="p"
            :d="d3.geoPath()(p)"
            :fill="colors[group]"
          ></path>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from "d3";
import nodeLinks from "./nodeLinks.json";
import forceWorker from "./force.worker.js";
import _ from "lodash";

import "animate.css";
import svgPanZoom from "svg-pan-zoom";
import { computed, reactive, ref, toRaw, unref } from "@vue/reactivity";
import { onMounted, watchEffect, watch } from "@vue/runtime-core";

import {
  MaxPriorityQueue,
  MinPriorityQueue,
} from "@datastructures-js/priority-queue";

class LengthPriorityQueue {
  constructor(length, priority) {
    this.length = length;
    this.queue = new MinPriorityQueue({ priority });
    this.priority = priority;
  }
  enqueue(item) {
    // 如果小于列表里最小的，就不插入
    if (
      !this.queue.isEmpty &&
      this.priority(item) <= this.queue.front().priority
    ) {
      return;
    }
    this.queue.enqueue(item);
    if (this.queue.size() > this.length) {
      this.queue.dequeue();
    }
  }
  dequeue() {
    return this.queue.dequeue();
  }
  size() {
    return this.queue.size();
  }
  toArray() {
    return this.queue.toArray().map((item) => item.element);
  }
}

import "animate.css";

export default {
  setup() {
    // 定义绘图参数
    const width = 800;
    const height = 600;

    const RANGE = [-500, 500];

    // 边和节点
    const nodes = ref(nodeLinks.nodes);
    const edges = ref(nodeLinks.edges);

    const el = ref(null);

    // 密度图路径
    let paths = ref({});

    //坐标轴缩放
    const x = d3.scaleLinear().domain(RANGE).range([0, width]);
    const y = d3.scaleLinear().domain(RANGE).range([0, height]);
    const rx = d3.scaleLinear().domain([0, width]).range(RANGE);
    const ry = d3.scaleLinear().domain([0, height]).range(RANGE);

    // 力引导布局
    let worker = new forceWorker();
    worker.postMessage({
      nodes: nodeLinks.nodes,
      edges: nodeLinks.edges,
      range: RANGE,
      height,
      width,
    });
    worker.onmessage = (e) => {
      switch (e.data.type) {
        case "tick":
          paths.value = e.data.contours;
          break;
        case "end":
          // nodes.value=nodes.value.map((d,i)=>_.assign(d,e.data.nodes[i],{selected:false,show:false}));
          nodes.value = e.data.nodes;
          edges.value = e.data.edges;
          quadtree.addAll(nodes.value);
          delaunay = d3.Delaunay.from(
            nodes.value,
            (d) => d.x,
            (d) => d.y
          );
          console.log("done.");
          break;
      }
    };

    //缩放
    const transform = reactive({
      k: 1,
      x: 0,
      y: 0,
    });

    let zoom = null;

    const initZoom = () => {
      zoom = svgPanZoom(el.value, {
        onUpdatedCTM: _.throttle(
          (e) => {
            transform.k = e.a;
            transform.x = e.e;
            transform.y = e.f;
          },
          500,
          { leading: true }
        ),
        dblClickZoomEnabled: false,
      });
    };
    onMounted(initZoom);

    // 精简显示
    let NodeThreshold = ref(100);

    let quadtree = d3
      .quadtree()
      .x((d) => d.x)
      .y((d) => d.y);

    const search = (x0, y0, x3, y3) => {
      let pq = new LengthPriorityQueue(NodeThreshold.value, (d) => d.degree);
      quadtree.visit((node, x1, y1, x2, y2) => {
        if (!node.length) {
          do {
            const {
              data: d,
              data: { x, y },
            } = node;
            if (x >= x0 && x < x3 && y >= y0 && y < y3) {
              pq.enqueue(d);
            }
          } while ((node = node.next));
        }
        return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
      });
      return pq.toArray();
    };

    const viewBox = computed(() => {
      const vx0 = rx((0 - transform.x) / transform.k);
      const vy0 = ry((0 - transform.y) / transform.k);
      const vx1 = rx((width - transform.x) / transform.k);
      const vy1 = ry((height - transform.y) / transform.k);
      return [vx0, vy0, vx1, vy1];
    });

    const LinkThreshold = ref(100);
    const showNodes = computed(() => {
      nodes.value;
      let res = search(...viewBox.value).map((d) => {
        if (d.id == selectedNodeIds.mouseSelected) {
          d.selected = true;
        } else {
          d.selected = false;
        }
        return d;
      });
      return res;
    });

    const showNodeIds = computed(() => {
      return new Set(showNodes.value.map((d) => d.index));
    });

    //显示边
    const connMtx = computed(() => {
      let res = {};
      for (let edge of edges.value) {
        let { source, target } = edge;
        if (typeof source === "object") {
          source = source.id;
        }
        if (typeof target === "object") {
          target = target.id;
        }
        _.setWith(res, [source, target], edge, Object);
        _.setWith(res, [target, source], edge, Object);
      }
      return res;
    });

    const showEdges = computed(() => {
      let queue = new LengthPriorityQueue(
        LinkThreshold.value,
        (d) => d.source.degree + d.target.degree
      );
      const node_ids = new Set(showNodes.value.map((d) => d.id));
      for (let node of showNodes.value) {
        _(connMtx.value[node.id])
          .values()
          .filter((d) => node_ids.has(d.target.id) && node.id == d.source.id)
          .forEach((d) => queue.enqueue(d));
      }
      let res = queue.toArray();
      // console.log(res);
      return res;
    });

    //鼠标交互
    let delaunay = d3.Delaunay.from([]);
    const selectedNodeIds = reactive({
      mouseSelected: null,
      other: new Set(),
      locked: false,
      nodeRef:null
    });

    const selectedNodes = computed(() => {
      return showNodes.value.filter(
        (d) => d.id == selectedNodeIds.mouseSelected
      );
    });

    const pointermove = _.debounce(function (e) {
      if (e.buttons != 0) {
        return;
      }
      if(selectedNodeIds.locked){
        return;
      }
      const { offsetX, offsetY } = e;
      const target_x = rx((offsetX - transform.x) / transform.k);
      const target_y = ry((offsetY - transform.y) / transform.k);
      const target_index = delaunay.find(target_x, target_y);
      selectedNodeIds.mouseSelected = showNodeIds.value.has(target_index)
        ? nodes.value[target_index].id
        : null;
    }, 100);

    const highlightLines = computed(() => {
      if (selectedNodeIds.mouseSelected == null) {
        return [];
      }
      return _.values(connMtx.value[selectedNodeIds.mouseSelected]);
    });

    const pointerout = function (e) {
      if(selectedNodeIds.locked){
        return;
      }
      selectedNodeIds.mouseSelected = null;
    };

    const onclick = function (e) {
      if (zoom == null) return;
      if (selectedNodeIds.locked) {
        selectedNodeIds.locked = false;
        return;
      } else {
        selectedNodeIds.locked = true;
      }
      const margin = 10;
      const target_x0 =
        _(highlightLines.value)
          .map((d) => Math.min(d.source.x, d.target.x))
          .min() - margin;
      const target_x1 =
        _(highlightLines.value)
          .map((d) => Math.max(d.source.x, d.target.x))
          .max() + margin;
      const target_y0 =
        _(highlightLines.value)
          .map((d) => Math.min(d.source.y, d.target.y))
          .min() - margin;
      const target_y1 =
        _(highlightLines.value)
          .map((d) => Math.max(d.source.y, d.target.y))
          .max() + margin;
      const tk1 = width / (x(target_x1) - x(target_x0));
      const tk2 = height / (y(target_y1) - y(target_y0));
      const tk = Math.min(tk1, tk2);
      if (isNaN(tk)) return;
      const tx = -tk * x(target_x0);
      const ty = -tk * y(target_y0);
      zoom.zoom(tk);
      zoom.pan({ x: tx, y: ty });
    };

    return {
      showEdges,
      showNodes,
      paths,
      d3,
      lodash: _,
      x,
      y,
      colors: {
        0: "steelblue",
        1: "green",
        2: "orange",
      },
      symbol: {
        0: d3.symbolCircle,
        1: d3.symbolSquare,
        2: d3.symbolTriangle,
      },
      el,
      transform,
      pointermove,
      pointerout,
      onclick,
      highlightLines,
      selectedNodeIds,
      selectedNodes,
    };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, fill 0.5s ease;
}
/* .fade-enter-to{
  transition: fill 0.3s ease;
} */

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* .point {
  transition: fill 0.3s ease;
} */
</style>