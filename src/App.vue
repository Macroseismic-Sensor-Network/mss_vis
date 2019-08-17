<template>
    <div id="app">
        <div>
            <PGVMap />
        </div>
        <div>
            <div id="graph_display">
                <PGVGraph v-for="cur_stream in streams" v-bind:key="cur_stream" v-bind:stream_id="cur_stream" :height="100 / streams.length"/>
            </div>
        </div>
    </div>
</template>

<script>
//import WebSocketDisplay from './components/WebSocketDisplay.vue'
import PGVMap from './components/PGVMap.vue'
import PGVGraph from './components/PGVGraph.vue'

export default {
    name: 'app',

    components: {
        PGVMap,
        PGVGraph,
    },

    data() {
        return {
            options: {
                scrollOverflow: false,
            },
        };
    },

    computed: {
        streams: function () {
            var available_streams = Object.keys(this.$store.state.pgv_data);
            return available_streams.sort();
        },
    },
}
</script>

<style lang="sass">
body
    margin-top: 0px;
    margin-left: 0px;
    margin-right: 0px;

</style>
