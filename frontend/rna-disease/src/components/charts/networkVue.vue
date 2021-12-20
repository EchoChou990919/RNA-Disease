<template>
    <svg width="800" height="600" viewBox="0,0,800,600">
        <g>
            <circle v-for="node in nodes" :key="node.id" :cx="x(node.x)" :cy="y(node.y)" r="5" fill="#999" />
            <line v-for="edge in edges" 
                stroke-width="2"
                stroke="#999"
                :key="edge.source.id+'-'+edge.target.id" 
                :x1="x(edge.source.x)"
                :y1="y(edge.source.y)"
                :x2="x(edge.target.x)"
                :y2="y(edge.target.y)"
            ></line>
        </g>
    </svg>
</template>

<script>
import * as d3 from "d3";
import nodeLinks from "../nodeLinks.json";

const width = 800;
const height = 600;

const RANGE = [-500, 500];



export default {
    data:()=>({
        nodes:nodeLinks.nodes,
        edges:nodeLinks.edges,
        simulation:d3.forceSimulation().stop(),
        x: d3.scaleLinear().domain(RANGE).range([0, width]),
        y: d3.scaleLinear().domain(RANGE).range([0, height]),
    }),
    created(){
        var nodes=this.nodes;
        var edges=this.edges;
        this.simulation
        .nodes(nodes)
        .force("link",d3.forceLink(edges).id(d=>d.id))
        .force("charge",d3.forceManyBody())
        .force("center",d3.forceCenter(0,0))
        .force("x",d3.forceX())
        .force("y",d3.forceY())
        .on("tick",()=>{
            this.nodes=nodes;
            this.edges=edges;
        }).restart();
    }
}
</script>