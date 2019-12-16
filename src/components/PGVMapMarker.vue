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
    <g v-bind:id="element_id">
        <circle v-bind:id="element_id + '_current'"
                :r="pgv_radius"
                :fill="pgv_fill"
                :stroke="pgv_stroke"
                :fill-opacity="current_fill_opacity"/>

        <circle v-bind:id="element_id + '_max'"
                :r="pgv_max_radius"
                :fill="pgv_max_fill"
                :stroke="pgv_max_stroke"
                :fill-opacity="max_fill_opacity"/>
    </g>
</template>


<script>
import * as d3 from "d3";

export default {
    name: 'PGVMapMarker',

    props: {
        station_id: String,
        x_utm: String,
        y_utm: String,
        radius_limits: Array,
    },

    mounted () {
        var scales = this.scales;
        var marker_svg = d3.select("#" + this.element_id + "_current");
        marker_svg.attr("cx", scales.x(this.x_utm))
                  .attr("cy", scales.y(this.y_utm))
                  .attr('stroke', 'black');

        marker_svg = d3.select("#" + this.element_id + "_max");
        marker_svg.attr("cx", scales.x(this.x_utm))
                  .attr("cy", scales.y(this.y_utm))
                  .attr('stroke', 'black');
        marker_svg.lower();

        var map_svg = d3.select("#map");
        this.svg_matrix = map_svg.node().getScreenCTM();

        window.addEventListener('resize', this.on_resize);
    },

    data() {
        return {
            scale: 1,
            current_fill_opacity: 1.0,
            max_fill_opacity: 0.6,
            svg_matrix: [],
        };
    },

    computed: {
        element_id: function() {
            return 'pgv_map_marker_' + this.station_id.replace(/\./g, '-');
        },

        svg_scale: function() {
            var scale = 1;
            if (this.svg_matrix.a)
            {
                scale = this.svg_matrix.a
            }
            return scale;
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
                radius = this.scale * scales.radius(this.pgv);
            }

            return radius / this.svg_scale;
        },

        pgv_max_radius: function() {
            var radius = 0;

            if (this.pgv_max) {
                const scales = this.scales;
                radius = this.scale * scales.radius(this.pgv_max);
            }

            return radius / this.svg_scale;
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

        on_resize: function() {
            var map_svg = d3.select("#map");
            this.svg_matrix = map_svg.node().getScreenCTM();
        },
    },
}
</script>


<style scoped lang="sass">

</style>
