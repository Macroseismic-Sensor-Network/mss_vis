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
    <g v-bind:id="element_id" class="leaflet-zoom-hide">
    </g>
</template>


<script>
import * as d3 from "d3";
//import * as poly_util from "../polygon_util.js";
import _ from "lodash"
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import * as concaveman from 'concaveman';
import * as polygon_offset from 'polygon-offset';
import L from 'leaflet';
import proj4 from 'proj4';

export default {
    name: 'ArchiveEventPlot',

    props: {
    },

    created () {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
                         this.$store.getters.prefix_options);
    },

    data() {
        return {
            element_id: "archive_event_plot_group",
            hull_offset: 5000,   // The outwards offset of the hull polygon [m]. 
            logger: undefined,
            pgv_markers: [],
            pgv_polygons: [],
            clip_path: undefined,
            clip_path_outline: undefined,
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

        current_event: function() {
            return this.$store.getters.current_event;
        },

        map_control: function() {
            return this.$store.getters.map_control;
        },

        leaflet_map: function() {
            return this.$store.getters.leaflet_map.map_object;
        },   

        map_redraw: function() {
            return this.$store.getters.leaflet_map.redraw;
        },
    },

    watch: {
        'map_control.show_archive_event': function () {
            this.plot_archive_event();
        },

        'map_redraw': function() {
            this.update_leaflet();
        },
    },

    methods: {
        plot_archive_event() {
            this.pgv_markers = [];
            this.pgv_polygons = [];
            this.clip_path = undefined;
            this.clip_path_outline = undefined;
            var scales= this.scales;
            var line_generator = d3.line().curve(d3.curveLinearClosed)
                                          .x(function(d) { return d[0]; })
                                          .y(function(d) { return d[1]; });

            var container = d3.select('#' + this.element_id);

            var stroke_opacity;
            var fill_opacity;
            var marker_fill_opacity;
            var fill_color;
            var vertices;
            var max_pgv;
            var simp_stations;
            var cur_station;
            var pgv_radius;

            // Clear all elements in the container.
            container.selectAll("*").remove();

            if (this.map_control.show_archive_event === undefined)
            {
                d3.select('#current_pgv_marker').style('visibility', 'visible');
                d3.select('#event_monitor_plot_group').style('visibility', 'visible');
            }
            else
            {
              this.logger.debug("Plotting the archive event.");
              d3.select('#current_pgv_marker').style('visibility', 'hidden');
              d3.select('#event_monitor_plot_group').style('visibility', 'hidden');
              var plot_event = this.$store.getters.event_archive[this.map_control.show_archive_event]
              var stations = [];
              var used_stations = Object.keys(plot_event.max_station_pgv_used);
              vertices = [];

              if (this.map_control.show_archive_event_cells == true)
              {
                for (const cur_snl of used_stations) {
                    for (const cur_station of this.stations) {
                        if (cur_station.name == cur_snl.split(/:/)[0]) {
                            stations.push(cur_station);
                            break;
                        }
                    }
                }
                for (const cur_station of stations) { 
                    vertices.push([cur_station.x_utm, cur_station.y_utm])
                }

                // Create the clipping path of the Voronoi cells using a concave hull.
                let hull = concaveman(vertices, 3, 20000);
                hull = _.cloneDeep(hull);
                let poly_offset = new polygon_offset();
                let polyline = poly_offset.data(hull).margin(this.hull_offset);
                var pl_wgs = this.utm_to_wgs84(polyline[0]);
                var pl_leaflet = this.lonlat_to_leaflet(pl_wgs);
                this.clip_path = container.append('clipPath').attr('id', 'archive_event_hull_clip')
                                                             .append('path').attr('d', line_generator(pl_leaflet));
                this.clip_path_outline = container.append('path').attr('d', line_generator(pl_leaflet))
                                                                 .attr('stroke', 'LightGreen')
                                                                 .attr('stroke-width', 2)
                                                                 .attr('fill', 'none');
                this.clip_path.lonlat = pl_wgs;
                this.clip_path_outline.lonlat = pl_wgs;


                // Create a convex hull and offset it with rounded corners.
                /*
                let convex_hull = d3.polygonHull(vertices);
                convex_hull = _.cloneDeep(convex_hull);
                for (let m = 0; m < convex_hull.length; m++)
                {
                    convex_hull[m][0] = scales.x(convex_hull[m][0]);
                    convex_hull[m][1] = scales.y(convex_hull[m][1]);
                }
                convex_hull = poly_util.rounded_hull(convex_hull.reverse(), this.hull_padding);
                this.logger.debug('convex hull: ', convex_hull);
                */


                // Create the Voronoi network.
                var voronoi = d3.voronoi();
                voronoi.extent([[this.map_limits.x_min, this.map_limits.y_min],
                               [this.map_limits.x_max, this.map_limits.y_max]]);
                var polygons = voronoi.polygons(vertices);

                fill_color = 'none';
                fill_opacity = 0.3;
                stroke_opacity = 0.3;

                var closed_poly;

                for (let k = 0; k < polygons.length; k++) {
                    const cur_poly = polygons[k];
                    if (cur_poly === undefined)
                    {
                        continue;
                    }
                    cur_station = stations[k];
                    const cur_snl = cur_station.name + ':' + cur_station.network + ':' + cur_station.location;
                    if (Object.keys(plot_event.max_station_pgv).includes(cur_snl))
                    {
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
                    var cp_wgs = this.utm_to_wgs84(closed_poly);
                    var cp_leaflet = this.lonlat_to_leaflet(cp_wgs);
                    let cur_pgv_polygon = container.append('path').attr('id', 'voronoi_cell_' + k)
                                            .attr('d', line_generator(cp_leaflet))
                                            .attr('stroke', fill_color)
                                            .attr('stroke-width', 1)
                                            .attr('stroke-opacity', fill_opacity)
                                            .attr('fill', fill_color)
                                            .attr('fill-opacity', fill_opacity)
                                            .attr("clip-path", "url(#archive_event_hull_clip)");
                    cur_pgv_polygon.lonlat= cp_wgs;
                    this.pgv_polygons.push(cur_pgv_polygon);

                    // Add the PGV circle marker showing the max. PGV of the
                    // event.
                    var cur_latlon = new L.LatLng(cur_station.y, cur_station.x);
                    pgv_radius = scales.radius(max_pgv) / this.svg_scale;
                    let cur_marker = container.append('circle').attr('id', 'voronoi_pgv_marker_' + k)
                                              .attr('cx', this.leaflet_map.latLngToLayerPoint(cur_latlon).x)
                                              .attr('cy', this.leaflet_map.latLngToLayerPoint(cur_latlon).y)
                                              .attr('r', pgv_radius)
                                              .attr('fill', fill_color)
                                              .attr('fill-opacity', marker_fill_opacity)
                                              .attr('stroke', 'black')
                                              .attr('stroke-opacity', marker_fill_opacity)
                                              .attr('stroke-width', 1);
                    cur_marker.lonlat = [[cur_station.x, cur_station.y]];
                    this.pgv_markers.push(cur_marker);
                }
              }
              else
              {
                let k = 0;
                for (const cur_simp of plot_event.overall_trigger_data) {
                    simp_stations = []
                    for (const cur_simp_station of cur_simp.simp_stations) {
                        let cur_name = cur_simp_station.split(/:/)[0]
                        cur_station = this.stations.find(x => x.name === cur_name);
                        simp_stations.push(cur_station);
                    }

                    vertices = [];
                    for (const cur_station of simp_stations) {
                        vertices.push([cur_station.x_utm,
                                       cur_station.y_utm]);
                    }
                    let vert_wgs = this.utm_to_wgs84(vertices);
                    let vert_leaflet = this.lonlat_to_leaflet(vert_wgs);

                    fill_color = 'none';
                    fill_opacity = 0.3;
                    stroke_opacity = 0.3;
                    max_pgv = cur_simp.pgv.map(function(row){ return Math.max.apply(Math, row); });
                    max_pgv = Math.max.apply(null, max_pgv);
                    fill_color = this.pgv_to_color(max_pgv);
                    if (cur_simp.trigger.includes(true)) {
                        this.logger.debug("Plotting vertices: " + vert_leaflet);
                        fill_opacity = 0.8;
                        stroke_opacity = 0.8;

                        let cur_pgv_simp = container.append('path').attr('id', 'voronoi_simp_' + k)
                                                .attr('d', line_generator(vert_leaflet))
                                                .attr('stroke', 'DarkGray')
                                                .attr('stroke-width', 5)
                                                .attr('fill', fill_color)
                                                .attr('fill-opacity', fill_opacity)
                                                .attr('stroke-opacity', stroke_opacity);
                        cur_pgv_simp.lonlat = vert_wgs;
                        this.pgv_polygons.push(cur_pgv_simp);
                    }
                    k = k + 1;
                }
              }
            }

        },


        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },

        utm_to_wgs84(src_coords) {
            proj4.defs("EPSG:32633", "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs");
            var dst_coords = [];
            src_coords.forEach(function(cur_coord) {
                dst_coords.push(proj4('EPSG:32633').inverse(cur_coord));

            });
            return dst_coords;
        },

        lonlat_to_leaflet(lonlat) {
            var xy_leaflet = []
            for (let k = 0; k < lonlat.length; k++) {
                let cur_latlon = new L.LatLng(lonlat[k][1], lonlat[k][0]);
                xy_leaflet.push([this.leaflet_map.latLngToLayerPoint(cur_latlon).x,
                                 this.leaflet_map.latLngToLayerPoint(cur_latlon).y]);
            }
            return xy_leaflet;
        },

        update_leaflet() {
            this.logger.debug("update_leaflet");
            var line_generator = d3.line().curve(d3.curveLinearClosed)
                                          .x(function(d) { return d[0]; })
                                          .y(function(d) { return d[1]; });

            // Update the PGV markers of the event.
            for (let k = 0; k < this.pgv_markers.length; k++) {
                let cur_marker = this.pgv_markers[k];
                let cur_coords_leaflet = this.lonlat_to_leaflet(cur_marker.lonlat);
                cur_marker.attr("cx", cur_coords_leaflet[0][0]);
                cur_marker.attr("cy", cur_coords_leaflet[0][1]);
            }

            // Update the Voronoi cell polygons.
            for (let k = 0; k < this.pgv_polygons.length; k++) {
                let cur_poly = this.pgv_polygons[k];
                let cur_coords_leaflet = this.lonlat_to_leaflet(cur_poly.lonlat)
                cur_poly.attr('d', line_generator(cur_coords_leaflet))
            }

            // Update the clip path.
            if (this.clip_path != undefined) 
            {
                let cur_coords_leaflet = this.lonlat_to_leaflet(this.clip_path.lonlat);
                this.clip_path.attr('d', line_generator(cur_coords_leaflet));

                // Update the clip path outline.
                this.clip_path_outline.attr('d', line_generator(cur_coords_leaflet));
            }
        },
    },
}
</script>


<style scoped lang="sass">

</style>
