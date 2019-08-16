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
        map_limits: Object,
        map_size: Object,
    },

    mounted () {
        var scales = this.get_scales();
        var marker_svg = d3.select("#" + this.element_id + "_current");
        marker_svg.attr("cx", scales.x(this.x_utm))
                  .attr("cy", scales.y(this.y_utm))
                  .attr('stroke', 'black');

        marker_svg = d3.select("#" + this.element_id + "_max");
        marker_svg.attr("cx", scales.x(this.x_utm))
                  .attr("cy", scales.y(this.y_utm))
                  .attr('stroke', 'black');
        marker_svg.lower();
    },

    data() {
        return {
            radius: 4,
            scale: 5,
            current_fill_opacity: 0.5,
            max_fill_opacity: 0.3,
        };
    },

    computed: {
        element_id: function() {
            return 'pgv_map_marker_' + this.station_id.replace(/\./g, '-');
        },

        pgv_radius: function() {
            var cur_pgv = this.$store.getters.current_pgv_by_station(this.$props.station_id);
            var map_svg = d3.select("#map");
            var matrix = map_svg.node().getScreenCTM();

            if (cur_pgv) {
                var radius = Math.log10(cur_pgv * 1000) + 6;
                if (radius > 20)
                {   
                    radius = 20;
                }
                return this.scale * radius / matrix.a;
            }
            else {
                return 4 / matrix.a;
            }
        },

        pgv_max_radius: function() {
            var cur_pgv = this.$store.getters.disp_range_max_pgv_by_station(this.$props.station_id);
            var map_svg = d3.select("#map");
            var matrix = map_svg.node().getScreenCTM();

            if (cur_pgv) {
                var radius = Math.log10(cur_pgv * 1000) + 6;
                if (radius > 20)
                {   
                    radius = 20;
                }
                return this.scale * radius / matrix.a;
            }
            else {
                return 0;
            }
        },

        pgv_fill: function() {
            var cur_pgv = this.$store.getters.current_pgv_by_station(this.$props.station_id);
            var cur_fill = 'grey';

            if (cur_pgv)
            {
                cur_fill = this.pgv_to_color(cur_pgv);
            }

            return cur_fill;
        },

        pgv_max_fill: function() {
            var cur_pgv = this.$store.getters.disp_range_max_pgv_by_station(this.$props.station_id);
            var cur_fill = 'grey';

            if (cur_pgv)
            {
                cur_fill = this.pgv_to_color(cur_pgv);
            }

            return cur_fill;
        },

        pgv_stroke: function() {
            var cur_pgv = this.$store.getters.current_pgv_by_station(this.$props.station_id);
            var cur_fill = 'black';

            if (cur_pgv)
            {
                if (cur_pgv >= 1e-4)
                {
                    cur_fill = 'red';
                }
            }

            return cur_fill;
        },

        pgv_max_stroke: function() {
            var cur_pgv = this.$store.getters.disp_range_max_pgv_by_station(this.$props.station_id);
            var cur_fill = 'black';

            if (cur_pgv)
            {
                if (cur_pgv >= 1e-4)
                {
                    cur_fill = 'red';
                }
            }

            return cur_fill;
        }
    },

    methods: {
        get_scales() {
            const x = d3.scaleLinear().domain([this.map_limits.x_min, 
                                               this.map_limits.x_max])
                                       .range([0, 4000]);
            const y = d3.scaleLinear().domain([this.map_limits.y_min,
                                               this.map_limits.y_max])
                                       .range([2500, 0]);
            return {x, y};
        },

        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            var scale = d3.scaleLog().domain([1e-6, 1e-2])
                                     .range([0, 1]);
            var color = d3.interpolatePlasma(scale(pgv));

            return color;
        },
    },
}
</script>


<style scoped lang="sass">

</style>
