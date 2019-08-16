<template>
    <g v-bind:id="element_id" :transform="legend_transform">
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
                    cur_pos.x = space + gap_x;
                    cur_pos.y = 0;
                }
                else
                {
                    space = this.pgv_radius[k-1] + this.pgv_radius[k];
                    cur_pos.x = position[k-1].x + space + gap_x;
                    cur_pos.y = position[k-1].y;
                }
                position.push(cur_pos);
            }
            return position;
        },

        legend_position: function() {
            var left_middle = {x: 0, y: 0};
            var width = this.marker_position[this.marker_position.length - 1].x +
                        this.pgv_radius[this.pgv_radius.length - 1];
            var height = this.pgv_radius[this.pgv_radius.length - 1];

            if (this.config.position == 'bottom-right')
            {
                left_middle.x = this.map_size.width - width - this.config.margin;
                left_middle.y = this.map_size.height - height - this.config.margin;
            }

            return left_middle;
        },

        map_size: function() {
            return this.$store.getters.map_config.size;  
        },

        map_limits: function() {
            return this.$store.getters.map_config.map_limits;
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        pgv_values: function() {
            return this.$store.getters.map_config.legend.values;
        },

        width: function() {
            return 0;    
        },

        config: function() {
            return this.$store.getters.map_config.legend;
        },

        legend_transform: function() {
            return "translate(" + this.legend_position.x + "," + this.legend_position.y + ")";
        },

    },

    methods: {
        compute_pgv_radius: function(pgv) {
            var cur_pgv = pgv;
            var radius = 4;

            if (cur_pgv) {
                const scales = this.scales;
                radius = this.scale * scales.radius(cur_pgv);
            }

            return radius / this.svg_scale;
        },


        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },

        on_resize: function() {
            var map_svg = d3.select("#map");
            this.svg_matrix = map_svg.node().getScreenCTM();
        }
    },
}
</script>


<style scoped lang="sass">

</style>
