<template>
    <div id="graph" style="height:400px;width:400px">
        <v-chart class="chart border" :option="option" />
    </div>
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { GraphChart } from "echarts/charts";
import { GridComponent } from 'echarts/components';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from "echarts/components";
import VChart from "vue-echarts";
import * as d3 from "d3";
import { ref, defineComponent, computed } from "vue";
import _ from "lodash";
import * as nodelink from '@/service/dataloader/nodelinks';
import nodelink_data from '/public/newNodeLinks.json';
import w_result from '/public/w_result.json';
import { loadDiseaseAttrs, doid2name } from "@/service/dataloader/diseaseDetail";

use([
    CanvasRenderer,
    GraphChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
]);

const props = defineProps({//id
    lncRNA_id: Number,
    disease_id: Number
})
const detail = loadDiseaseAttrs();
const names = doid2name(detail.diseases);
const nodeObject = _(nodelink_data["nodes"]).map(n => [n.id, n]).fromPairs().value();
var score = w_result["w"];
var maxs = Math.max.apply(null, score)
var mins = Math.min.apply(null, score)
const d = computed(() => {

    var linki = nodelink.net2connTable()[props.lncRNA_id];///
    var linkj = nodelink.net2connTable()[props.disease_id];
    var data = [{
        'id': props.lncRNA_id,
        'name': nodeObject[props.lncRNA_id].name,
        'categorg': 0
    }, {
        'id': props.disease_id,
        'name': names[nodeObject[props.disease_id].name],
        'categorg': 1
    }];

    var link = [];
    var left_link = new Array(1200).fill(0);
    var right_link = new Array(1200).fill(0);
    for (var itemi of linki) {
        if(itemi["type"]==0)
        left_link[itemi["target"]] = itemi["value"];
    }
    for (var itemj of linkj) {
        if(itemj["type"]==0)
        right_link[itemj["target"]] = itemj["value"];
    }
    // console.log(right_link)
    var data_w = [];
    for (var i = 0; i < 1200; i++) {
        if (left_link[i] != 0 && right_link[i] != 0 && i != props.lncRNA_id && i != props.disease_id && nodeObject[i] != undefined) {
            data_w.push({ "id": i, "w": score[i] });
        }
    }
    _.sortBy(data_w, function (d) {
        return d.w;
    });

    for (var item = 0; item < Math.min(10,data_w.length); item++) {
        var i = data_w[item].id;

        data.push({
            'id': i,
            'order': item,
            'name': nodeObject[i].name.slice(0, 4)=="DOID" ? names[nodeObject[i].name] : nodeObject[i].name,
            'categorg': nodeObject[i].category,
            'score': score[i]
        });
        link.push({
            'source': 0,
            'target': item + 2,
            'value': left_link[i]
        });
        link.push({
            'source': item + 2,
            'target': 1,
            'value': right_link[i]
        });
    }

    return {
        'nodes': data,
        'links': link
    };
})

const nodes = computed(() => {
    return d.value.nodes;
})
const links = computed(() => {
    return d.value.links;
})
console.log(nodes)

var h = 400;
var w = 400;
// var h=document.getElementById('graph').clientHeight;
// console.log(h);


// var color_node = d3.scaleLinear().domain([mins, 0, maxs]).range(["#5151FF", "#D3D3D3", "#FF5151"]);

var color_node = d3.interpolateRdBu
var nor = d3.scaleLinear().domain([maxs, 0, mins]).range([0, 0.5, 1])

var color_link = d3.interpolateBlues;

var size = d3.scaleLinear().domain([1, 60]).range([25, 5])

const interval = computed(() => {
    return h * 0.9 / (nodes.value.length - 3);
})
const r = computed(() => {
    return h * 0.9 / (nodes.value.length - 2) / 2;
})


const option = computed(() => {
    var op = {
        // tooltip: {},
        animationDurationUpdate: function (order) {
            // 越往后的数据时长越大
            console.log(order)
            return order * 100;
        },
        animationEasingUpdate: 'quinticInOut',
        grid: {
            show: false,
            top: 0.05 * h,
            left: 0,
            right: 0,
            bottom: 0.05 * h
        },
        series: [{
            type: 'graph',
            layout: 'none',
            // symbolSize: Math.min(h * 0.9 / 15, 0.8 * h * 0.9 / (data.length - 2)),
            symbolSize: r.value * 2 / 2,
            roam: true,
            top: r.value + 0.05 * h,
            bottom: r.value + 0.05 * h,
            // label: {
            //     fontSize: 13,
            //     show: false
            // },

            edgeLabel: {
                fontSize: 8
            },
            emphasis: {
                scale: true,
                focus: "adjacency",
                blurScope: "coordinateSystem",
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                    symbolSize: 15,
                },
                lineStyle: {
                    width: 5
                },
                label: {
                    show: true,
                    fontSize: 10,
                    formatter: (params) => {
                        // console.log(params)
                        if(params.data.id==props.lncRNA_id||params.data.id==props.disease_id)
                            return params.data.name;
                        return params.data.name +" : " + _.round(params.data.score,3)

                    },
                    position: 'top'
                },
                edgeLabel: {
                    show: true,
                    fontSize: 10,
                    formatter: (params) => {
                        // console.log(params)
                        return nodes.value[params.data.source].name + "--" + nodes.value[params.data.target].name + "  " + _.round(params.data.value,3)

                    }
                }
            },

            data: nodes.value.map(function (node) {
                console.log(nodeObject[props.lncRNA_id].name)
                if (node.id == props.lncRNA_id) {
                    node.x = -h * 0.45;
                    node.y = h * 0.45;
                    node.symbolSize = h * 0.9 / 15;
                    node.label = {
                        show: true,
                        position: 'top'
                    }
                    node.tooltip = {
                        formatter: () => {
                            return ""
                        }
                    }
                    node.itemStyle = {
                        color: "steelblue"
                    }
                } else if (node.id == props.disease_id) {
                    node.x = h * 0.45;
                    node.y = h * 0.45;
                    node.symbolSize = h * 0.9 / 15;
                    node.label = {
                        show: true,
                        position: 'top'
                    }
                    node.tooltip = {
                        formatter: () => {
                            return ""
                        }
                    }
                    node.itemStyle = {
                        color: "green"
                    }
                } else {
                    node.x = 0;
                    node.y = node.order * interval.value;
                    node.value = node.score;
                    // node.label = {
                    //     show: false
                    // };
                    node.tooltip = {
                        formatter: (params) => {
                            return node.name + '&nbsp&nbsp&nbsp<b>' + node.data.value + '</b>'
                        }
                    }
                    node.itemStyle = {
                        color: color_node(nor(node.score))
                    }
                }
                if (node.categorg == 0) node.symbol = "circle";
                else if (node.categorg == 1) node.symbol = "rect";
                else node.symbol = "triangle";


                return node;
            }),

            links: links.value.map(function (edge) {
                edge.lineStyle = {
                    color: color_link(edge.value)
                }
                edge.tooltip = {
                    // formatter: (params) => {
                    //         console.log(params)
                    //         return data[params.data.source].name + "--" + data[params.data.target].name + '&nbsp&nbsp&nbsp<b>' + params.data.value + '</b>'
                    //     }
                    formatter: () => {

                        return nodes.value[edge.source].name + "--" + nodes.value[edge.target].name + '&nbsp&nbsp&nbsp<b>' + edge.value + '</b>'

                    }
                    // formatter: ' {c}'
                }
                return edge;
            }),
            lineStyle: {
                opacity: 0.9,
                width: 1.2,
                curveness: 0
            }
        }]
    }
    console.log(op)
    return op;
}
);
</script>

<style scoped>
.chart {
    height: 100%;
}
</style>