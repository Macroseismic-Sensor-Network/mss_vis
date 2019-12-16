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

    <div class="hello">
      <h1>Test site for the MSS data visualization</h1>
      <p> The site demonstrates the visualization of near real-time data received from the MSS data server using websockets. The PGV data from the server is pushed at an interval of 10 seconds.</p>
        <h1>{{ title }}</h1>

        <h2> Map view </h2>
        <PGVMap />

        <h2> PGV graphs </h2>
        <PGVGraph v-for="cur_stream in streams" v-bind:key="cur_stream" stream_id="cur_stream" />


        <!--
        <h2> Current PGV data </h2>
        <ul>
            <PGVDisplay v-for="cur_stream in streams" v-bind:station_name="cur_stream" />
        </ul>
        -->

        <!--
        <h2> Station divs </h2>
        <div v-for="(cur_pgv, cur_name, cur_ind) in pgv_value" v-bind:id="cur_name">
            <b>{{ cur_name }}</b>
        </div>
        -->
    </div>
</template>

<script>
import PGVMap from '../components/PGVMap.vue'
//import PGVDisplay from '../components/PGVDisplay.vue'
import PGVGraph from '../components/PGVGraph.vue'

export default {
    name: 'WebSocketDisplay',
    props: {
        title: String
    },
    components: {
        //PGVDisplay,
        PGVGraph,
        PGVMap
    },
    computed: {
        streams: function () {
            var available_streams = Object.keys(this.$store.state.pgv_data);
            return available_streams.sort();
        },
        pgv_value: function () {
            return this.$store.state.pgv_data
        },
        current_pgv: function () {
            return this.$store.getters.current_pgv
        },
        test: function () {
            var tmp = {}
            console.log("Computing test.")
            //console.log(this.$store.state.stations)
            //tmp.push(this.$store.state.stations.length)
            //console.log(tmp.pop())
            //console.log(tmp)
            for (var key in this.$store.state.pgv_data) {
                var last_ind = this.$store.state.pgv_data[key].data.length - 1
                console.log("key: " + key)
                console.log("last_ind: " + last_ind)
                console.log(this.$store.state.pgv_data[key].data[last_ind])
                tmp[key] = this.$store.state.pgv_data[key].data[last_ind]
            }
            console.log(tmp)
            return tmp
        }
    }
}

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
