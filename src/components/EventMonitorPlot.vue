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
    name: 'EventMonitorPlot',

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
            element_id: "event_monitor_plot_group",
            hull_offset: 5000,
            logger: undefined,
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

        event_warning: function() {
            return this.$store.getters.event_warning;
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
        current_event: function (new_value, old_value) {
            this.logger.debug('current_event has changed.' + new_value + old_value);
            if (this.map_control.show_event_monitor)
            {
                this.plot_event_monitor();
            }
        },

        'map_control.show_event_warning': function() {
            //this.plot_event_monitor();
        },

        'map_control.show_event_monitor': function() {
            if (this.map_control.show_event_monitor) {
                this.plot_event_monitor();
            }
            else
            {
                var container = d3.select('#' + this.element_id);
                // Clear all elements in the container.
                container.selectAll("*").remove();
                this.pgv_polygons = [];
                this.clip_path = undefined;
                this.clip_path_outline = undefined;
            }
        },

        'map_redraw': function() {
            this.update_leaflet();
        },
    },

    methods: {
        plot_event_monitor() {
            this.logger.debug("Plotting the event monitor.");
            var container = d3.select('#' + this.element_id);
            // Clear all elements in the container.
            container.selectAll("*").remove();
            this.pgv_polygons = [];
            this.clip_path = undefined;
            this.clip_path_outline = undefined;

            // Return if current_event is emtpy.
            if (Object.keys(this.current_event).length === 0)
            {
                return;
            }


            var line_generator = d3.line().curve(d3.curveLinearClosed)
                                          .x(function(d) { return d[0]; })
                                          .y(function(d) { return d[1]; });

            var k;

            var fill_color = 'none';
            var fill_opacity = 0.3;
            var vertices = [];
            var voronoi;
            var polygons;
            var closed_poly;

            var max_pgv;
            var stations = [];
            var used_stations = Object.keys(this.current_event.max_station_pgv_used);


            // Collect the station objects of all stations used by the event.
            for (const cur_snl of used_stations) {
                for (const cur_station of this.stations) {
                    if (cur_station.name == cur_snl.split(/:/)[0]) {
                        stations.push(cur_station);
                        break;
                    }
                }
            }
            this.logger.debug('Stations: ', stations);

            // Create the vertices array of the station coordinates.
            for (const cur_station of stations) { 
                vertices.push([cur_station.x_utm, cur_station.y_utm])
            }
            this.logger.debug(vertices);

            // Create the clipping path.
            let hull = concaveman(vertices, 3, 20000);
            hull = _.cloneDeep(hull);
            let poly_offset = new polygon_offset();
            let polyline = poly_offset.data(hull).margin(this.hull_offset);
            var pl_wgs = this.utm_to_wgs84(polyline[0]);
            var pl_leaflet = this.lonlat_to_leaflet(pl_wgs);
            this.clip_path = container.append('clipPath').attr('id', 'event_monitor_hull_clip')
                                                         .append('path').attr('d', line_generator(pl_leaflet));
            this.clip_path_outline = container.append('path').attr('d', line_generator(pl_leaflet))
                                                             .attr('stroke', 'Turquoise')
                                                             .attr('stroke-width', 4)
                                                             .attr('fill', 'none');
            this.clip_path.lonlat = pl_wgs;
            this.clip_path_outline.lonlat = pl_wgs;

            // Create the polygons of the Voronoi cells using the map border as 
            // the network extent.
            voronoi = d3.voronoi();
            voronoi.extent([[this.map_limits.x_min, this.map_limits.y_min],
                           [this.map_limits.x_max, this.map_limits.y_max]]);
            polygons = voronoi.polygons(vertices);
            for (k = 0; k < polygons.length; k++) {
                const cur_poly = polygons[k];
                const cur_station = stations[k];
                const cur_snl = cur_station.name + ':' + cur_station.network + ':' + cur_station.location;
                if (Object.keys(this.current_event.max_station_pgv).includes(cur_snl))
                {
                    this.logger.debug("Use triggered PGV for station " + cur_snl);
                    max_pgv = this.current_event.max_station_pgv[cur_snl];
                    fill_opacity = 0.8;
                }
                else
                {
                    max_pgv = this.current_event.max_station_pgv_used[cur_snl];
                    fill_opacity = 0.2;
                }
                fill_color = this.pgv_to_color(max_pgv);


                // Plot the Voronoin cell polygon.
                closed_poly = cur_poly;
                closed_poly.push(cur_poly[0]);
                let cp_wgs = this.utm_to_wgs84(closed_poly);
                let cp_leaflet = this.lonlat_to_leaflet(cp_wgs);
                let cur_pgv_polygon = container.append('path').attr('id', 'voronoi_cell_' + k)
                                        .attr('d', line_generator(cp_leaflet))
                                        .attr('stroke', fill_color)
                                        .attr('stroke-width', 1)
                                        .attr('stroke-opacity', fill_opacity)
                                        .attr('fill', fill_color)
                                        .attr('fill-opacity', fill_opacity)
                                        .attr("clip-path", "url(#event_monitor_hull_clip)");
                cur_pgv_polygon.lonlat= cp_wgs;
                this.pgv_polygons.push(cur_pgv_polygon);
            }

        },

        plot_event_monitor_delaunay() {
            var scales= this.scales;
            var line_generator = d3.line().curve(d3.curveLinearClosed)
                                          .x(function(d) { return scales.x(d[0]); })
                                          .y(function(d) { return scales.y(d[1]); });

            var container = d3.select('#' + this.element_id);

            var stroke_opacity;
            var fill_opacity;
            var fill_color;
            var vertices;

            var max_pgv;
            var simp_stations;

            // Clear all elements in the container.
            container.selectAll("*").remove();

            if (this.map_control.show_event_monitor && ('overall_trigger_data' in this.current_event))
            {
                for (const cur_simp of this.current_event.overall_trigger_data) {
                    simp_stations = []
                    for (const cur_simp_snl of cur_simp.simp_stations) {
                        const cur_simp_station_name = cur_simp_snl.split(/:/)[0]
                        const cur_station = this.stations.find(x => x.name === cur_simp_station_name);
                        this.logger.debug("cur_station: " + cur_station.id);
                        simp_stations.push(cur_station);
                    }

                    vertices = [];
                    for (const cur_station of simp_stations) {
                        vertices.push([cur_station.x_utm,
                                       cur_station.y_utm]);
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
