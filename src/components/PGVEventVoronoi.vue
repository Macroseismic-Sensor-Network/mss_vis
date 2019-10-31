<template>
    <g v-bind:id="event_id">
    </g>
</template>


<script>
import * as d3 from "d3";

export default {
    name: 'PGVEventVoronoi',

    props: {
        event_id: String,
    },

    mounted () {
        // Create the Delaunay triangles.
        var vertices = [];
        var scales= this.scales;
        console.log(this.stations);
        for (const cur_station of this.stations) { 
            vertices.push([cur_station.x_utm, cur_station.y_utm])
        }
        console.log(vertices);

        console.log(this.map_limits);
        var voronoi = d3.voronoi();
        voronoi.extent([[this.map_limits.x_min, this.map_limits.y_min],
                       [this.map_limits.x_max, this.map_limits.y_max]]);
        var triangles = voronoi.triangles(vertices);
        var polygons = voronoi.polygons(vertices);

        var line_generator = d3.line().x(function(d) { return scales.x(d[0]); })
                                      .y(function(d) { return scales.y(d[1]); });

        var container = d3.select('#' + this.event_id);
        //container.append('path');

        var closed_poly;
        for (const cur_poly of triangles) {
            closed_poly = cur_poly;
            closed_poly.push(cur_poly[0]);
            container.append('path').attr('d', line_generator(closed_poly))
                                    .attr('stroke', 'orange')
                                    .attr('stroke-width', 5)
                                    .attr('fill', 'none');
        }

        for (const cur_poly of polygons) {
            closed_poly = cur_poly;
            closed_poly.push(cur_poly[0]);
            container.append('path').attr('d', line_generator(closed_poly))
                                    .attr('stroke', 'black')
                                    .attr('stroke-width', 5)
                                    .attr('fill', 'none');
        }

    },

    data() {
        return {
        };
    },

    computed: {
        stations: function() {
            return this.$store.getters.station_meta;
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        map_limits: function() {
            return this.$store.getters.map_config.map_limits;
        },

    },

    methods: {
    },
}
</script>


<style scoped lang="sass">

</style>
