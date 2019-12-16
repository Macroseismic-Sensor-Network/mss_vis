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
    <li v-bind:id="element_id">
        <b>{{ station_name }}:</b>
        <p>latest pgv: {{ current_pgv }}</p>
        <p>data length: {{ data_length }}</p>
    </li>
</template>


<script>
export default {
    name: 'PGVDisplay',
    props: {
        station_name: String,
    },
    computed: {
        current_pgv: function() {
            return this.$store.getters.current_pgv_by_station(this.$props.station_name);
        },

        element_id: function() {
            return 'pgv_disp_' + this.station_name;
        },

        data_length: function() {
            return this.$store.getters.data_length(this.$props.station_name);
        },
    }
}
</script>


<style scoped>
li {
    display: inline-block;
    margin: 0 10px;
    padding: 10px;
    background-color: DarkSeaGreen;

}
</style>
