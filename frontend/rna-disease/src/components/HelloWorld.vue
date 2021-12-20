<template>
  <div class="hello">
    <network-graph :nodes="nodes" :edges="edges"></network-graph>
    <network-vue></network-vue>
  </div>
</template>

<script>
import NetworkGraph from "./charts/NetworkGraph.vue";

import nodeLinks from "./nodeLinks.json";
import networkVue from './charts/networkVue.vue'

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  components: {
    NetworkGraph,
    networkVue
  },
  computed: {
    // nodes() {
    //   let nodes = [];
    //   for (let i = 0; i < 500; i++) {
    //     nodes.push({
    //       id: i,
    //     });
    //   }

    //   for (let i = 500; i < 1000; i++) {
    //     nodes.push({
    //       id: i,
    //     });
    //   }

    //   for (let i = 1000; i < 1500; i++) {
    //     nodes.push({
    //       id: i,
    //     });
    //   }
    //   return nodes;
    // },
    // edges(){
    //   let edges = [];
    //   for (let i = 0; i < 500; i++) {
    //     for (let j = 0; j < 500; j++) {
    //       if (Math.random() < 0.05)
    //         edges.push({
    //           source: i,
    //           target: j,
    //         });
    //     }
    //   }

    //   for (let i = 500; i < 1000; i++) {
    //     for (let j = 500; j < 1000; j++) {
    //       if (Math.random() < 0.05)
    //         edges.push({
    //           source: i,
    //           target: j,
    //         });
    //     }
    //   }

    //   for (let i = 1000; i < 1500; i++) {
    //     for (let j = 1000; j < 1500; j++) {
    //       if (Math.random() < 0.05)
    //         edges.push({
    //           source: i,
    //           target: j,
    //         });
    //     }
    //   }

    //   return edges;
    // }
  },
  data:()=>({
    nodes:nodeLinks.nodes,
    edges:nodeLinks.edges
  })
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
