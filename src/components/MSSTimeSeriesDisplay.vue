<template>
    <div id="mss-display-container">
        <div id="timeseries-container" class = "grid-x">
            <div class="cell"><PGVGraph v-for="cur_station in stations"
                                        v-bind:key="cur_station.id"
                                        v-bind:stream_id="cur_station.id" 
                                        height=200 />
            </div>
        </div>
    </div>
</template>

<script>

import PGVGraph from '../components/PGVGraph.vue'

export default {
    name: 'MSSTimeSeriesDisplay',
    props: {
        title: String
    },
    components: {
        PGVGraph,
    },

    mounted() {
        this.$store.commit("LOAD_STATION_METADATA");
    },

    computed: {
        stations: function() {
            return this.$store.getters.station_meta;
        },

    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
