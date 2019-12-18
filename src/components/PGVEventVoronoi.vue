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

        event_warning: function() {
            return this.$store.getters.event_warning;
        },

        current_event: function() {
            return this.$store.getters.current_event;
        },

        map_control: function() {
            return this.$store.getters.map_control;
        },
    },

    watch: {
        detection_result: function (new_value, old_value) {
            console.log('Detection result has changed.' + new_value + old_value);
            this.plot_detection_result();
        },

        'map_control.show_detection_result': function() {
            this.plot_detection_result();
        },

        'map_control.show_event_warning': function() {
            this.plot_detection_result();
        },

        'map_control.show_event_monitor': function() {
            this.plot_detection_result();
        },

        'map_control.show_archive_event': function () {
            this.plot_detection_result();
        },
    },

    methods: {
        plot_detection_result() {
            console.log("Plotting the detection properties.");

            // Create the Delaunay triangles.
            var scales= this.scales;
            //var used_stations = this.detection_result.used_stations;

            var line_generator = d3.line().curve(d3.curveLinearClosed)
                                          .x(function(d) { return scales.x(d[0]); })
                                          .y(function(d) { return scales.y(d[1]); });

            var container = d3.select('#' + this.event_id);

            // Clear all elements in the container.
            container.selectAll("*").remove();

            if (this.map_control.show_detection_result && ('trigger_data' in this.detection_result)) {
                for (const cur_simp of this.detection_result.trigger_data) {
                    var simp_stations = []
                    for (const cur_simp_station of cur_simp.simp_stations) {
                        var cur_station = this.stations.find(x => x.name === cur_simp_station);
                        simp_stations.push(cur_station);
                    }

                    var vertices = [];
                    for (const cur_station of simp_stations) {
                        vertices.push([parseFloat(cur_station.x_utm),
                                       parseFloat(cur_station.y_utm)]);
                    }

                    var fill_color = 'none';
                    var fill_opacity = 0.3;
                    var stroke_opacity = 0.3;
                    var max_pgv = cur_simp.pgv.map(function(row){ return Math.max.apply(Math, row); });
                    max_pgv = Math.max.apply(null, max_pgv);
                    fill_color = this.pgv_to_color(max_pgv);
                    if (cur_simp.trigger.includes(true)) {
                        fill_opacity = 0.8;
                        stroke_opacity = 0.8;
                    }

                    container.append('path').attr('d', line_generator(vertices))
                                            .attr('stroke', 'black')
                                            .attr('stroke-width', 5)
                                            .attr('fill', fill_color)
                                            .attr('fill-opacity', fill_opacity)
                                            .attr('stroke-opacity', stroke_opacity);
                }
            }

            if (this.map_control.show_event_warning) {
                if (Object.keys(this.event_warning).length > 0)
                {
                    for (var k = 0; k < this.event_warning.simp_stations.length; k++)
                    {
                        var simp_pgv = this.event_warning.trigger_pgv[k];
                        simp_stations = [];
                        for (const cur_simp_station of this.event_warning.simp_stations[k]) {
                            cur_station = this.stations.find(x => x.name === cur_simp_station);
                            simp_stations.push(cur_station);
                        }

                        vertices = [];
                        for (const cur_station of simp_stations) {
                            vertices.push([parseFloat(cur_station.x_utm),
                                           parseFloat(cur_station.y_utm)]);
                        }

                        fill_color = 'none';
                        fill_color = this.pgv_to_color(simp_pgv);
                        fill_opacity = 0.5;
                        stroke_opacity = 0.5;

                        container.append('path').attr('d', line_generator(vertices))
                                                .attr('stroke', 'DarkOrange')
                                                .attr('stroke-width', 5)
                                                .attr('fill', fill_color)
                                                .attr('fill-opacity', fill_opacity)
                                                .attr('stroke-opacity', stroke_opacity);

                    }
                }
            }

            if (this.map_control.show_event_monitor && ('overall_trigger_data' in this.current_event))
            {
                for (const cur_simp of this.current_event.overall_trigger_data) {
                    simp_stations = []
                    for (const cur_simp_station of cur_simp.simp_stations) {
                        cur_station = this.stations.find(x => x.name === cur_simp_station);
                        simp_stations.push(cur_station);
                    }

                    vertices = [];
                    for (const cur_station of simp_stations) {
                        vertices.push([parseFloat(cur_station.x_utm),
                                       parseFloat(cur_station.y_utm)]);
                    }

                    fill_color = 'none';
                    fill_opacity = 0.3;
                    stroke_opacity = 0.3;
                    max_pgv = cur_simp.pgv.map(function(row){ return Math.max.apply(Math, row); });
                    max_pgv = Math.max.apply(null, max_pgv);
                    fill_color = this.pgv_to_color(max_pgv);
                    if (cur_simp.trigger.includes(true)) {
                        fill_opacity = 0.8;
                        stroke_opacity = 0.8;

                        container.append('path').attr('d', line_generator(vertices))
                                                .attr('stroke', 'ForestGreen')
                                                .attr('stroke-width', 5)
                                                .attr('fill', fill_color)
                                                .attr('fill-opacity', fill_opacity)
                                                .attr('stroke-opacity', stroke_opacity);
                    }
                }
            }

            if (this.map_control.show_archive_event != undefined)
            {
                console.log("Plotting the archive event.");
                var plot_event = this.$store.getters.event_archive[this.map_control.show_archive_event]
                for (const cur_simp of plot_event.overall_trigger_data) {
                    simp_stations = []
                    for (const cur_simp_station of cur_simp.simp_stations) {
                        cur_station = this.stations.find(x => x.name === cur_simp_station);
                        simp_stations.push(cur_station);
                    }

                    vertices = [];
                    for (const cur_station of simp_stations) {
                        vertices.push([parseFloat(cur_station.x_utm),
                                       parseFloat(cur_station.y_utm)]);
                    }

                    fill_color = 'none';
                    fill_opacity = 0.3;
                    stroke_opacity = 0.3;
                    max_pgv = cur_simp.pgv.map(function(row){ return Math.max.apply(Math, row); });
                    max_pgv = Math.max.apply(null, max_pgv);
                    fill_color = this.pgv_to_color(max_pgv);
                    if (cur_simp.trigger.includes(true)) {
                        fill_opacity = 0.8;
                        stroke_opacity = 0.8;

                        container.append('path').attr('d', line_generator(vertices))
                                                .attr('stroke', 'DarkGray')
                                                .attr('stroke-width', 5)
                                                .attr('fill', fill_color)
                                                .attr('fill-opacity', fill_opacity)
                                                .attr('stroke-opacity', stroke_opacity);
                    }
                }
            }

            /*
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
            */
        },

        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },

    },
}
</script>


<style scoped lang="sass">

</style>
