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
    <div id="mss-display-containter">
        <div id="map-container" class = "grid-x">
            <div class="cell"><PGVMap :key="mapKey" v-on:reload-map-2="forceReloadMap()"/></div>
        </div>
    </div>
</template>

<script>

import PGVMap from '../components/PGVMap.vue'

export default {
    name: 'MSSDisplay',
    props: {
        title: String
    },
	data() {
		return {
			mapKey:0,
		}
	},
    components: {
        PGVMap,
    },
	methods: {
		forceReloadMap() {
			//this.mapKey+=1;
			//$('#app').load();
		},
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
