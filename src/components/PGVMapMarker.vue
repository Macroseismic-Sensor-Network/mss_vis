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
       v-on:click="inspect_station"
       v-if="is_realtime">
        <circle v-bind:id="element_id + '_max'"
                :r="pgv_history_radius"
                :fill="pgv_history_fill"
                :stroke="pgv_history_stroke"
                :fill-opacity="max_fill_opacity"
                :cx="leaflet_x"
                :cy="leaflet_y"/>
        <circle v-bind:id="element_id + '_current'"
                v-on:mouseover="on_mouseover('current')"
                v-on:mouseout="on_mouseout('current')"
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
import * as moment from 'moment';
import _ from "lodash"

export default {
    name: 'PGVMapMarker',

    props: {
        nsl_code: String,
        lon: Number,
        lat: Number,
    },

    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);

        // Create the debounced methods here. When creating them in the methods
        // section, the cancel function is not available.
        this.on_mouseover = _.debounce(function (source ) {
            this.logger.debug("on_mouseover debounce " + source);
            if (this.on_mouseout.cancel)
            {
                this.logger.debug("cancel on_mouseout");
                this.on_mouseout.cancel();
            }
            if (!this.mouseover_first_src)
                this.mouseover_first_src = source
            let latlon = new L.LatLng(this.lat, this.lon);
            let layer_pos = this.leaflet_map.latLngToLayerPoint(latlon);
            this.logger.debug("cont_pos: ", layer_pos);
            if (!this.tooltip)
            {
                this.logger.debug('Creating the new tooltip.');
                this.tooltip = d3.select('.leaflet-tooltip-pane')
                    .append("div")
                        .style("position", "absolute")
                        .attr("class", "leaflet-tooltip leaflet-zoom-animated")
                        .html(this.tooltip_string);
            }
            this.tooltip.style("visibility", "visible");
            let pos_x = layer_pos.x + 10;
            let pos_y = layer_pos.y + 0;
            this.tooltip.style("transform", 'translate3D(' + pos_x + 'px,' + pos_y + 'px,0px)')
        }, 200, {leading: true,});

        this.on_mouseout = _.debounce(function(source) {
            this.logger.debug("on_mouseout debounce " + source);
            if (source === this.mouseover_first_src)
            {
                this.tooltip.style("visibility", "hidden");
                this.tooltip.remove();
                this.tooltip = undefined;
                this.mouseover_first_src = undefined
            }
        }, 100);
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
            tooltip: undefined,
            mouseover_first_src: undefined,
        };
    },

    watch: {
        map_redraw: function() {
            this.update();
        },

        pgv: function() {
            if (this.tooltip)
            {
                this.tooltip.html(this.tooltip_string);
            }
        },
    },

    computed: {
        element_id: function() {
            return 'pgv_map_marker_' + this.nsl_code.replace(/:/g, '-');
        },

        map_redraw: function() {
            return this.$store.getters.leaflet_map.redraw;
        },

        leaflet_map: function() {
            return this.$store.getters.leaflet_map.map_object;
        },   

        current_pgv: function() {
            return this.$store.getters.current_pgv_by_station(this.$props.nsl_code);
        },

        pgv: function() {
            return this.current_pgv.latest_pgv;
        },

        pgv_history: function() {
            return this.current_pgv.pgv_history;
        },

        latest_time: function() {
            return moment.unix(this.current_pgv.latest_time).utc().format();
        },

        pgv_radius: function() {
            const scales = this.scales;
            var radius = scales.radius(0);

            if (this.pgv) {
                radius = scales.radius(this.pgv);
            }

            return radius;
        },

        pgv_history_radius: function() {
            var radius = 0;

            if (this.pgv_history) {
                const scales = this.scales;
                radius = scales.radius(this.pgv_history);
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

        pgv_history_fill: function() {
            var cur_fill = 'grey';

            if (this.pgv_history)
            {
                cur_fill = this.pgv_to_color(this.pgv_history);
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

        pgv_history_stroke: function() {
            var cur_fill = 'black';

            if (this.pgv_history)
            {
                if (this.pgv_history >= 1e-4)
                {
                    cur_fill = 'red';
                }
            }

            return cur_fill;
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        is_realtime: function() {
            return this.$store.getters.is_realtime; 
        },

        tooltip_string: function() {
            let pgv_string = 'keine Daten';
            let pgv_history_string = 'keine Daten';
            let nsl_parts = this.nsl_code.split(':')

            if (this.pgv)
                pgv_string = 'PGV: ' + (this.pgv * 1000).toFixed(4) + ' mm/s'

            if (this.pgv_history)
                pgv_history_string = 'PGV (last 60s): ' + (this.pgv_history * 1000).toFixed(4) + ' mm/s'

            let tooltip_string = nsl_parts[1] + '<br>' + pgv_string + '<br>' + pgv_history_string
            return tooltip_string
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
            this.$store.commit('add_inspect_station', this.nsl_code);
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
