<template>
    <div id="mss-display-containter">
        <div id="map-container" class = "grid-x">
            <div class="cell"><PGVMap /></div>
        </div>
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

import PGVMap from '../components/PGVMap.vue'
import PGVGraph from '../components/PGVGraph.vue'

export default {
    name: 'MSSDisplay',
    props: {
        title: String
    },
    components: {
        PGVMap,
        PGVGraph,
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