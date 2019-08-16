<template>
    <g v-bind:id="element_id">
        <circle v-for="(cur_pgv, k) in pgv_values"
                v-bind:key="cur_pgv"
                :id="'pgv_legend_marker_' + k"
                :pgv="pgv_values[k]"
                :r="pgv_radius[k]"
                :cx="marker_position[k].x"
                :cy="marker_position[k].y"
                :fill="marker_color[k]"/>
    </g>
</template>


<script>
import * as d3 from "d3";

export default {
    name: 'PGVLegend',

    props: {
        name: String,
        pgv_values: Array,
        radius_limits: Array,
        pgv_limits: Array,
        map_limits: Object,
        position: Object,
    },

    mounted () {
        //var markers = d3.selectAll("circle[id^='pgv_legend_marker']");
        //var self = this;
        var map_svg = d3.select("#map");

        this.svg_matrix = map_svg.node().getScreenCTM();

        /*
        markers.each(function(d, k) {
            console.log("Processing marker " + k +".", this);
            var cur_el = d3.select(this);
            cur_el.attr("cx", self.$props.position.x + k * 200)
                  .attr("cy", self.$props.position.y);

        });
        */

        for (var k = 0; k < this.pgv_values.length; k++)
        {
            this.marker_color[k] = this.pgv_to_color(this.pgv_values[k]);
        }

        window.addEventListener('resize', this.on_resize);
    },

    data() {
        return {
            scale: 1,
            svg_matrix: [],
            marker_color: [],
        };
    },

    computed: {
        element_id: function() {
            return 'pgvlegend_' + this.name;
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
            var radius = [];

            for (var k = 0; k < this.pgv_values.length; k++)
            {
                radius.push(this.compute_pgv_radius(this.pgv_values[k]));
            }
            return radius;
        },

        marker_position: function() {
            var position = [];
            var gap_x = 10;

            for (var k = 0; k < this.pgv_values.length; k++)
            {
                var cur_pos = {x: 0, y: 0};
                var space = 0;
                if (k == 0)
                {
                    space = this.pgv_radius[k];
                    cur_pos.x = this.$props.position.x + space + gap_x;
                    cur_pos.y = this.$props.position.y;
                }
                else
                {
                    space = this.pgv_radius[k-1] + this.pgv_radius[k];
                    cur_pos.x = position[k-1].x + space + gap_x;
                    cur_pos.y = this.$props.position.y;
                }
                position.push(cur_pos);
            }

            return position;
        },

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

        compute_pgv_radius: function(pgv) {
            var cur_pgv = pgv;
            var radius = 4;

            if (cur_pgv) {
                const scales = this.get_scales();
                radius = this.scale * scales.radius(cur_pgv);
            }

            return radius / this.svg_scale;
        },


        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            var scale = d3.scaleLog().domain([1e-6, 1e-2])
                                     .range([0, 1]);
            var color = d3.interpolatePlasma(scale(pgv));

            return color;
        },

        on_resize: function() {
            //var markers = d3.selectAll("circle[id^='pgv_legend_marker']");
            //var self = this;
            //markers.each(function(d, k) {
            //    var cur_el = d3.select(this);
            //    cur_el.attr("r", self.pgv_radius(self.pgv_values[k]));
            //});
            var map_svg = d3.select("#map");
            this.svg_matrix = map_svg.node().getScreenCTM();
        }
    },
}
</script>


<style scoped lang="sass">

</style>
