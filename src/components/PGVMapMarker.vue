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
        radius_limits: Array,
        pgv_limits: Array,
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

        var map_svg = d3.select("#map");
        this.svg_matrix = map_svg.node().getScreenCTM();

        window.addEventListener('resize', this.on_resize);
    },

    data() {
        return {
            scale: 1,
            current_fill_opacity: 0.85,
            max_fill_opacity: 0.3,
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

        pgv_radius: function() {
            var cur_pgv = this.$store.getters.current_pgv_by_station(this.$props.station_id);
            //var map_svg = d3.select("#map");
            //var matrix = map_svg.node().getScreenCTM();

            var radius = 4;

            if (cur_pgv) {
                const scales = this.get_scales();
                radius = this.scale * scales.radius(cur_pgv);
            }

            return radius / this.svg_scale;
        },

        pgv_max_radius: function() {
            var cur_pgv = this.$store.getters.disp_range_max_pgv_by_station(this.$props.station_id);
            //var map_svg = d3.select("#map");
            //var matrix = map_svg.node().getScreenCTM();

            var radius = 0;

            if (cur_pgv) {
                const scales = this.get_scales();
                radius = this.scale * scales.radius(cur_pgv);
            }

            return radius / this.svg_scale;
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
            const radius = d3.scaleLog().domain(this.$props.pgv_limits)
                                        .range(this.$props.radius_limits);
            return {x, y, radius};
        },

        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            var scale = d3.scaleLog().domain([1e-6, 1e-2])
                                     .range([0, 1]);
            var color = d3.interpolatePlasma(scale(pgv));

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
