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

        svg_scale: function() {
            return this.$store.getters.svg_scale;
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
            //this.plot_detection_result();
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
            this.plot_archive_event();
        },
    },

    methods: {
        plot_archive_event() {
            var scales= this.scales;
            var line_generator = d3.line().curve(d3.curveLinearClosed)
                                          .x(function(d) { return scales.x(d[0]); })
                                          .y(function(d) { return scales.y(d[1]); });

            var container = d3.select('#' + this.event_id);

            var stroke_opacity;
            var fill_opacity;
            var marker_fill_opacity;
            var fill_color;
            var vertices;
            var max_pgv;
            var simp_stations;
            var cur_station;
            var k;
            var pgv_radius;

            // Clear all elements in the container.
            container.selectAll("*").remove();

            if (this.map_control.show_archive_event === undefined)
            {
                d3.select('#current_pgv_marker').style('visibility', 'visible');
            }
            else
            {
              console.log("Plotting the archive event.");
              d3.select('#current_pgv_marker').style('visibility', 'hidden');
              var plot_event = this.$store.getters.event_archive[this.map_control.show_archive_event]
              var stations = [];
              var used_stations = Object.keys(plot_event.max_station_pgv_used);
              vertices = [];

              if (this.map_control.show_archive_event_cells != undefined)
              {
                for (const cur_snl of used_stations) {
                    for (const cur_station of this.stations) {
                        if (cur_station.name == cur_snl.split(/:/)[0]) {
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

                // Create the clipping path.
                var hull = d3.polygonHull(vertices);
                container.append('clipPath').attr('id', 'convex_hull_clip')
                                      .append('path').attr('d', line_generator(hull));
                container.append('path').attr('d', line_generator(hull))
                                        .attr('stroke', 'black')
                                        .attr('stroke-width', 8)
                                        .attr('fill', 'none');

                console.log(this.map_limits);
                var voronoi = d3.voronoi();
                voronoi.extent([[this.map_limits.x_min, this.map_limits.y_min],
                               [this.map_limits.x_max, this.map_limits.y_max]]);
                var polygons = voronoi.polygons(vertices);

                fill_color = 'none';
                fill_opacity = 0.3;
                stroke_opacity = 0.3;

                var closed_poly;

                for (k = 0; k < polygons.length; k++) {
                    const cur_poly = polygons[k];
                    cur_station = stations[k];
                    const cur_snl = cur_station.name + ':' + cur_station.network + ':' + cur_station.location;
                    if (Object.keys(plot_event.max_station_pgv).includes(cur_snl))
                    {
                        console.log("Use triggered PGV for station " + cur_snl);
                        max_pgv = plot_event.max_station_pgv[cur_snl];
                        fill_opacity = 0.8;
                        marker_fill_opacity = 1.0;
                    }
                    else
                    {
                        max_pgv = plot_event.max_station_pgv_used[cur_snl];
                        fill_opacity = 0.2;
                        marker_fill_opacity = 0.4;
                    }
                    fill_color = this.pgv_to_color(max_pgv);


                    // Plot the Voronoin cell polygon.
                    closed_poly = cur_poly;
                    closed_poly.push(cur_poly[0]);
                    container.append('path').attr('id', 'voronoi_cell_' + k)
                                            .attr('d', line_generator(closed_poly))
                                            .attr('stroke', fill_color)
                                            .attr('stroke-width', 1)
                                            .attr('stroke-opacity', fill_opacity)
                                            .attr('fill', fill_color)
                                            .attr('fill-opacity', fill_opacity)
                                            .attr("clip-path", "url(#convex_hull_clip)");

                    // Add the PGV circle marker showing the max. PGV of the
                    // event.
                    pgv_radius = scales.radius(max_pgv) / this.svg_scale;
                    container.append('circle').attr('id', 'voronoi_pgv_marker_' + k)
                                              .attr('cx', scales.x(cur_station.x_utm))
                                              .attr('cy', scales.y(cur_station.y_utm))
                                              .attr('r', pgv_radius)
                                              .attr('fill', fill_color)
                                              .attr('fill-opacity', marker_fill_opacity)
                                              .attr('stroke', 'black')
                                              .attr('stroke-opacity', marker_fill_opacity)
                                              .attr('stroke-width', 4);

                }
              }
              else
              {
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
            }

        },

        plot_detection_result() {
            console.log("Plotting the detection properties.");

            // Create the Delaunay triangles.
            var scales= this.scales;
<<<<<<< HEAD
=======
            //var used_stations = this.detection_result.used_stations;

>>>>>>> tgm/master
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
                        var cur_station_name = cur_simp_station.split(/:/)[0];
                        var cur_station = this.stations.find(x => x.name === cur_station_name);
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

<<<<<<< HEAD

=======
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
>>>>>>> tgm/master
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
