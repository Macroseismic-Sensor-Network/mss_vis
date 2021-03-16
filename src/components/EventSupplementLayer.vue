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
    <div></div>
</template>

<script>

import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import L from 'leaflet';
import 'leaflet-timedimension';

export default {
    name: 'EventSupplementLayer',
    props: {
        category: String,
        name: String,
    },
    components: {
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
            this.$store.getters.prefix_options);

    },
    mounted() {
        this.logger.debug('The Component is mounted.');
    },
    data() {
        return {
            layer: undefined,
            lang_title: {
                eventpgv: {
                    pgvstation: 'PGV Stationsmaker',
                    pgvvoronoi: 'PGV Voronoizellen',
                },
                pgvsequence: {
                    pgvstation: 'PGV Stationsmarker Zeitreihe',
                    pgvvoronoi: 'PGV Voronoizellen Zeitreihe',
                }
            },
        };
    },
    watch: {
        is_shown: function(new_state) {
            if (new_state)
            {
                this.plot_layer();
            }
            else
            {
                if (this.layer)
                    this.supplement_group.removeLayer(this.layer);
                    this.layer = undefined;
            }
        },

        public_id: function() {
            this.logger.debug('The public_id has changed.');
            this.logger.debug(this.is_shown);
            if (this.is_shown)
            {
                if (this.layer)
                {
                    this.logger.debug('Removing the layer.')
                    this.supplement_group.removeLayer(this.layer);
                }
                this.logger.debug('Plotting the layer.')
                this.logger.debug(this.is_loaded);
                if (this.is_loaded)
                {
                    this.plot_layer();
                }
            }
        },

        is_loaded: function() {
            this.logger.debug('The is_loaded state has changed.');
            this.logger.debug(this.is_shown);
            if (this.is_shown)
            {
                if (this.layer)
                {
                    this.logger.debug('Removing the layer.')
                    this.supplement_group.removeLayer(this.layer);
                }
                this.logger.debug('Plotting the layer.')
                this.logger.debug(this.is_loaded);
                this.plot_layer();
            }
        },
    },

    computed: {
        public_id: function() {
            if (this.active_event)
            {
                return this.active_event.public_id;
            }
            else
            {
                return undefined;
            }
        },

        active_event: function() {
            return this.$store.getters.active_recent_event;
        },

        is_loaded: function() {
            if (this.supplement_data === undefined) {
                return false;
            }
            else {
                return true;
            }
        },

        show_icon: function() {
            if (this.is_shown)
                return 'mdi mdi-eye';
            else
                return 'mdi mdi-eye-off';
        },

        show_tooltip: function() {
            if (this.is_shown)
                return 'verstecke';
            else
                return 'zeige';
        },

        title: function() {
            return this.lang_title[this.category][this.name];
        },

        is_shown: function() {
            return this.$store.getters.is_event_supplement_shown(this.category, this.name)
        },

        supplement_group: function() {
            return this.$store.getters.leaflet_map.layer_groups.event_supplement;
        },

        supplement_data: function() {
            if (this.public_id)
            {
                return this.$store.getters.get_event_supplement(this.public_id,
                                                                this.category,
                                                                this.name);
            }
            else
            {
                return undefined;
            }
        },

        display_settings: function() {
            return this.$store.getters.display_settings;
        },

        scales: function() {
            return this.$store.getters.scales;
        },
    },
    methods: {
        plot_layer: function() {
            let supplement_id = this.category + '/' + this.name
            switch (supplement_id)
            {
                case 'eventpgv/pgvstation':
                    this.plot_pgvstation();
                    break;

                case 'eventpgv/pgvvoronoi':
                    this.plot_pgvvoronoi();
                    break;

                case 'eventpgv/isoseismalfilledcontour':
                    this.plot_isoseismalfilledcontour();
                    break;

                case 'pgvsequence/pgvstation':
                    this.plot_pgvsequence_pgvstation();
                    break;

                case 'pgvsequence/pgvvoronoi':
                    this.plot_pgvsequence_pgvvoronoi();
                    break;
            }
        },

        plot_pgvstation: function() {
            var self = this;
            let marker_style = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            this.logger.debug("Adding pgvstation layer.");
            this.layer = L.geoJSON(this.supplement_data,
                                           {
                                               pointToLayer: function(feature, lat_lon) {
                                                    if( feature.properties.pgv) {
                                                        marker_style.fillColor = self.pgv_to_color(feature.properties.pgv);
                                                    }
                                                    else
                                                    {
                                                        marker_style.fillColor = '#777777';
                                                    }
                                                    marker_style.radius = self.scales.radius(feature.properties.pgv);
                                                    let marker = L.circleMarker(lat_lon, marker_style);
                                                    let pgv_string = 'keine Daten'
                                                    let nsl_parts = feature.properties.nsl.split(':')
                                                    if (feature.properties.pgv)
                                                        pgv_string = (feature.properties.pgv * 1000).toFixed(4) + ' mm/s'

                                                    marker.bindTooltip(nsl_parts[1] + "<br>PGV: " + pgv_string).openTooltip();
                                                    return marker;
                                               },
                                           }
                                          );
            this.supplement_group.addLayer(this.layer);
            this.layer.bringToFront();
        },

        plot_pgvvoronoi: function() {
            var self = this;
            let voronoi_style = {
                fillColor: "#ffffff",
                color: "#000000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3,
            };
            this.logger.debug("Adding pgvvoronoi.");
            this.layer = L.geoJSON(this.supplement_data,
                                           {
                                                style: function(feature) {
                                                    voronoi_style.fillColor = self.pgv_to_color(feature.properties.pgv);
                                                    if (feature.properties.triggered === true)
                                                    {
                                                        voronoi_style.fillOpacity = 1;
                                                    }
                                                    else
                                                    {
                                                        voronoi_style.fillOpacity = 0.3;
                                                    }
                                                    return voronoi_style;
                                                },
                                               onEachFeature: function(feature, layer) {
                                                    let pgv_string = 'keine Daten'
                                                    let nsl_parts = feature.properties.nsl.split(':')
                                                    if (feature.properties.pgv)
                                                        pgv_string = (feature.properties.pgv * 1000).toFixed(4) + ' mm/s'

                                                   layer.bindTooltip("PGV: " + pgv_string + "<br>gemessen an " + nsl_parts[1],
                                                    { sticky: true,
                                                    }).openTooltip();
                                               },
                                           }
            );
            this.supplement_group.addLayer(this.layer);
            this.layer.bringToBack();
        },

        plot_isoseismalfilledcontour: function() {
            var self = this;
            let ems98 = this.$store.getters.ems98;
            let polygon_style = {
                fillColor: "#ffffff",
                color: "#000000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3,
            };
            this.logger.debug("Adding isoseismalfilledcontour.");
            this.layer = L.geoJSON(this.supplement_data,
                                           {
                                                style: function(feature) {
                                                    if(feature.properties.intensity < 2)
                                                    {
                                                        polygon_style.fillColor = self.pgv_to_color(0.00003);
                                                        polygon_style.color = polygon_style.fillColor;
                                                        polygon_style.fillOpacity = 0.3;
                                                        polygon_style.opacity = 0.3;
                                                    }
                                                    else
                                                    {
                                                        polygon_style.fillColor = self.pgv_to_color(feature.properties.pgv);
                                                        polygon_style.color = '#000000';
                                                        polygon_style.fillOpacity = 0.8;
                                                        polygon_style.opacity = 1;
                                                    }

                                                    return polygon_style;
                                                },
                                                //onEachFeature: function(feature, layer) {
                                                //    let intensity = 1
                                                //    if (feature.properties.intensity >= 2)
                                                //        intensity = feature.properties.intensity;
                                                //    let ems98_level = ems98[Math.floor(intensity)]
                                                //    layer.bindTooltip("Intensität: " + intensity + '<br>' + ems98_level.definition,
                                                //        { sticky: true,
                                                //        }).openTooltip();
                                                //},
                                                onEachFeature: function(feature, layer) {
                                                    let intensity = 1;
                                                    let pgv = 0;
                                                    let pgv_string = '< 0.1 mm/s';
                                                    if (feature.properties.intensity >= 2)
                                                    {
                                                        intensity = feature.properties.intensity;
                                                        pgv = feature.properties.pgv;
                                                    }

                                                    if (pgv > 0)
                                                    {
                                                        pgv_string = (pgv * 1000).toFixed(4);
                                                    }
                                                    let ems98_level = ems98[Math.floor(intensity)]
                                                    layer.bindTooltip("PGV: " + pgv_string + '<br>' + 'entspricht I = ' + intensity + ' (' + ems98_level.definition + ')',
                                                        { sticky: true,
                                                        }).openTooltip();
                                                },
                                           }
            );
            this.supplement_group.addLayer(this.layer);
            this.layer.bringToBack();
        },

        plot_pgvsequence_pgvstation: function() {
            this.logger.debug('Adding pgvstation sequence.');
            let self = this;
            let marker_style = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            let geojson_layer = L.geoJSON(this.supplement_data,
                {
                    pointToLayer: function(feature, lat_lon) {
                        if( feature.properties.pgv) {
                            marker_style.fillColor = self.pgv_to_color(feature.properties.pgv);
                        }
                        else
                        {
                            marker_style.fillColor = '#777777';
                        }
                        marker_style.radius = self.scales.radius(feature.properties.pgv);
                        let marker = L.circleMarker(lat_lon, marker_style);
                        let pgv_string = 'keine Daten'
                        let nsl_parts = feature.properties.nsl.split(':')
                        if (feature.properties.pgv)
                            pgv_string = (feature.properties.pgv * 1000).toFixed(4) + ' mm/s'

                        marker.bindTooltip(nsl_parts[1] + "<br>PGV: " + pgv_string).openTooltip();
                        return marker;
                    },
                }
            );
            this.layer = L.timeDimension.layer.geoJson(geojson_layer,
                {
                    updateCurrentTime: true,
                    updateTimeDimension: true,
                    duration: 'PT0S',
                    updateTimeDimensionMode: 'replace',
                },
            );
            this.supplement_group.addLayer(this.layer);
            this.layer.bringToFront();
        },

        plot_pgvsequence_pgvvoronoi: function() {
            var self = this;
            let voronoi_style = {
                fillColor: "#ffffff",
                color: "#000000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.3,
            };
            let geojson_layer = L.geoJSON(this.supplement_data,
                                           {
                                               style: function(feature) {
                                                   voronoi_style.fillColor = self.pgv_to_color(feature.properties.pgv);
                                                   if (feature.properties.triggered === true)
                                                   {
                                                       voronoi_style.fillOpacity = 1;
                                                   }
                                                   else
                                                   {
                                                       voronoi_style.fillOpacity = 0.3;
                                                   }
                                                   return voronoi_style;
                                               },
                                               onEachFeature: function(feature, layer) {
                                                    let pgv_string = 'keine Daten'
                                                    let nsl_parts = feature.properties.nsl.split(':')
                                                    if (feature.properties.pgv)
                                                        pgv_string = (feature.properties.pgv * 1000).toFixed(4) + ' mm/s'

                                                   layer.bindTooltip("PGV: " + pgv_string + "<br>gemessen an " + nsl_parts[1]).openTooltip();
                                               },
                                           }
            );
            this.layer = L.timeDimension.layer.geoJson(geojson_layer,
                {
                    updateCurrentTime: true,
                    updateTimeDimension: true,
                    duration: 'PT0S',
                    updateTimeDimensionMode: 'replace',
                },
            );
            this.supplement_group.addLayer(this.layer);
            this.layer.bringToBack();
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
