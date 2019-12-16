<!--
/*****************************************************************************
 * LICENSE
 *
 * This file is part of mss_vis.
 * 
 * If you use mss_vis in any program or publication, please inform and
 * acknowledge its authors.
 * 
 * mss_vis is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * mss_vis is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with mss_vis. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2019 Stefan Mertl
 *****************************************************************************/
-->

<template>
    <div id="mss-display-container">
        <div id="timeseries-container" class = "grid-x">
            <div class="cell"><PGVGraph v-for="cur_station in stations"
                                        v-bind:key="cur_station.id"
                                        v-bind:stream_id="cur_station.id" 
                                        height=100 />
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
        console.log("Mounted timeseries display.");
        this.$store.commit("LOAD_STATION_METADATA");
    },

    computed: {
        stations: function() {
            var stations = this.$store.getters.station_meta;
            return stations.sort((a, b) => a.id.localeCompare(b.id))
        },

    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
