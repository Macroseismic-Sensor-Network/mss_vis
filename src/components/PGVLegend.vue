<template>
    <g v-bind:id="element_id">
        <circle v-for="(cur_pgv, k) in pgv_values"
                v-bind:key="cur_pgv"
                :id="'pgv_legend_marker_' + k"
                :cx="k * 100"
                cy="100"
                r="10"
                fill="black"/>
    </g>
</template>


<script>
import * as d3 from "d3";

export default {
    name: 'PGVLegend',

    props: {
        name: String,
        pgv_values: Array,
    },

    mounted () {
        var markers = d3.selectAll("circle[id^='pgv_legend_marker']");
        var self = this;
        markers.each(function(d, k) {
            console.log("Processing marker " + k +".", this);
            var cur_el = d3.select(this);
            cur_el.attr("r", self.pgv_radius(self.pgv_values[k]));
            //cur_el.attr("r", 30);
        });
    },

    data() {
        return {
            scale: 2,
        };
    },

    computed: {
        element_id: function() {
            return 'pgvlegend_' + this.name;
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
            return {x, y};
        },

        pgv_radius: function(pgv) {
            var cur_pgv = pgv;
            var map_svg = d3.select("#map");
            var matrix = map_svg.node().getScreenCTM();
            console.log("matrix: ", matrix);
            console.log("pgv: ", cur_pgv);

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
