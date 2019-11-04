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

        detection_result: function() {
            return this.$store.getters.detection_result;
        },
    },

    watch: {
        detection_result(new_value, old_value) {
            console.log('Detection result has changed.' + new_value + old_value);
            this.plot_detection_result();
        },
    },

    methods: {
        plot_detection_result() {
            console.log("Plotting the detection result.");

            // Create the Delaunay triangles.
            var vertices = [];
            var scales= this.scales;
            var used_stations = this.detection_result.used_stations;
            var stations = [];

            for (const cur_snl of used_stations) {
                for (const cur_station of this.stations) {
                    if (cur_station.name == cur_snl[0]) {
                        stations.push(cur_station);
                        break;
                    }
                }
            }
            console.log('Stations: ', stations);
            for (const cur_station of stations) { 
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
    },
}
</script>


<style scoped lang="sass">

</style>
