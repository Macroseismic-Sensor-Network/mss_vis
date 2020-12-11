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
    <g v-bind:id="element_id"
       class="leaflet-zoom-hide markerGroup"
       v-on:click="inspect_station">
        <circle v-bind:id="element_id + '_max'"
                :r="pgv_max_radius"
                :fill="pgv_max_fill"
                :stroke="pgv_max_stroke"
                :fill-opacity="max_fill_opacity"
                :cx="leaflet_x"
                :cy="leaflet_y"/>
        <circle v-bind:id="element_id + '_current'"
                :r="pgv_radius"
                :fill="pgv_fill"
                :stroke="pgv_stroke"
                :fill-opacity="current_fill_opacity" 
                :cx="leaflet_x"
                :cy="leaflet_y"/>

    </g>
</template>


<script>
// eslint-disable-next-line
import * as d3 from "d3";
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import L from 'leaflet';

export default {
    name: 'PGVMapMarker',

    props: {
        station_id: String,
        lon: Number,
        lat: Number,
    },

    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);
    },

    mounted () {
        this.update();
    },

    data() {
        return {
            current_fill_opacity: 1.0,
            max_fill_opacity: 0.6,
            logger: undefined,
            leaflet_x: undefined,
            leaflet_y: undefined,
        };
    },

    watch: {
        map_redraw: function() {
            this.update();
        },
    },

    computed: {
        element_id: function() {
            return 'pgv_map_marker_' + this.station_id.replace(/\./g, '-');
        },

        map_redraw: function() {
            return this.$store.getters.leaflet_map.redraw;
        },

        leaflet_map: function() {
            return this.$store.getters.leaflet_map.map_object;
        },   

        pgv: function() {
            return this.$store.getters.current_pgv_by_station(this.$props.station_id);
        },

        pgv_max: function() {
            return this.$store.getters.disp_range_max_pgv_by_station(this.$props.station_id);
        },

        pgv_radius: function() {
            const scales = this.scales;
            var radius = scales.radius(0);

            if (this.pgv) {
                radius = scales.radius(this.pgv);
            }

            return radius;
        },

        pgv_max_radius: function() {
            var radius = 0;

            if (this.pgv_max) {
                const scales = this.scales;
                radius = scales.radius(this.pgv_max);
            }

            return radius;
        },

        pgv_fill: function() {
            var cur_fill = 'grey';

            if (this.pgv)
            {
                cur_fill = this.pgv_to_color(this.pgv);
            }

            return cur_fill;
        },

        pgv_max_fill: function() {
            var cur_fill = 'grey';

            if (this.pgv_max)
            {
                cur_fill = this.pgv_to_color(this.pgv_max);
            }

            return cur_fill;
        },

        pgv_stroke: function() {
            var cur_fill = 'black';

            if (this.pgv)
            {
                if (this.pgv >= 1e-4)
                {
                    cur_fill = 'red';
                }
            }

            return cur_fill;
        },

        pgv_max_stroke: function() {
            var cur_fill = 'black';

            if (this.pgv_max)
            {
                if (this.pgv_max >= 1e-4)
                {
                    cur_fill = 'red';
                }
            }

            return cur_fill;
        },

        map_limits: function() {
            return this.$store.getters.map_config.map_limits;
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        pgv_limits: function() {
            return this.$store.getters.map_config.pgv_limits;
        },
    },

    methods: {
        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },

        inspect_station() {
            this.$store.commit('add_inspect_station', this.station_id);
        },

        update() {
            let latlon = new L.LatLng(this.lat, this.lon);
            this.leaflet_x = this.leaflet_map.latLngToLayerPoint(latlon).x;
            this.leaflet_y = this.leaflet_map.latLngToLayerPoint(latlon).y;
        },
    },
}
</script>


<style scoped lang="sass">
// Leaflet disables the clicking on individual svg elements.
// Set the pointer-events to make the markers clickable.
.leaflet-pane #current_pgv_marker > g 
    pointer-events: auto
    cursor: pointer

</style>
