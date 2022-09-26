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
  <div class="graph_container">
    <div class="diagram_header">
      <div class="title">{{ title }}</div>
    </div>
  
    <div class="diagram_pgv_axes"
         ref="diagram_pgv_axes"
         v-bind:id="element_id"
         v-resize:debounce="on_resize">
    </div>
  </div>
</template>

<script>

import resize from 'vue-resize-directive'
import Plotly from 'plotly.js/dist/plotly'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'DiagramPGV',
    props: {
    },
    components: {},
    directives: {
        resize,
    },
    mounted() { 
        this.new_plot();
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
                         this.$store.getters.prefix_options);
        this.$watch('plotly_data', this.update);
        //this.$watch('display_range', this.update_range);
    },
    data: function () {
        return {
            title: 'PGV der Stationen',
            layout: {
                margin: {
                    l: 40,
                    r: 2,
                    t: 2,
                    b: 40
                },
                /*
                title: { text:'PGV',
                         font: {
                             family: 'Courier New, monospace',
                             size: 24
                         },
                         xref: 'paper',
                         yref: 'paper',
                         x: 0.025,
                         y: 0.975,
                         xanchor: 'left',
                         yanchor: 'top'
                       },
                */
                legend: { x: 1,
                          xanchor: 'right',
                          y: 1
                        },
                xaxis: {
                    type: 'category',
                    autorange: true,
                    fixedrange: false,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    mirror: 'ticks',
                    showline: true,
                    ticks: 'inside',
                    zeroline: false,
                    title: { text: 'Station',
                       },
                },
                yaxis: {
                    type: 'log',
                    autorange: false,
                    fixedrange: true,
                    range: [-3, 1], 
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    showline: true,
                    mirror: 'ticks',
                    ticks: 'inside',
                    zeroline: false,
                    title: { text:'PGV [mm/s]',
                       },
                },
            },

            config: {
                //responsive: true
            }
        }
    },
    computed: {
        active_event: function() {
            return this.$store.getters.active_recent_event;
        },

        public_id: function() {
            if (this.active_event) {
                return this.active_event.public_id;
            }
            else {
                return undefined;
            }
        },
        
        element_id: function() {
            return 'diagram_pgv';
        },

        is_sprengung_duernbach: function() {
            if (this.active_event) {
                let active_event = this.active_event;
                let duernbach_regions = ['steinbruch dürnbach',
                                         'hohe wand'];
                
                if (active_event.event_class.toLowerCase() == 'sprengung' && duernbach_regions.includes(active_event.event_region.toLowerCase())) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        },

        pgvstation_supplement: function() {
            if (this.active_event) {
                return this.$store.getters.get_event_supplement(this.public_id,
                                                                'eventpgv',
                                                                'pgvstation');
            }
            else {
                return undefined;
            }
        },

        pgv_data: function() {
            let pgvstation = this.pgvstation_supplement;
            if (pgvstation) {
                let ret = {};
                let nsl = [];
                let pgv = [];
                let hypo_dist = [];
                let epi_dist = [];
           
                for (let k = 0; k < pgvstation.features.length; k++) {
                    let feature = pgvstation.features[k];
                    let cur_nsl = feature.properties.nsl
                    nsl.push(cur_nsl);
                    pgv.push(feature.properties.pgv);
                    if (this.active_event.hypo) {
                        hypo_dist.push(this.active_event.hypo_dist[cur_nsl])
                        epi_dist.push(this.active_event.epi_dist[cur_nsl])
                    }
                }
                ret['nsl'] = nsl;
                ret['pgv'] = pgv;
                ret['hypo_dist'] = hypo_dist;
                ret['epi_dist'] = epi_dist;
                return ret;
            }
            else {
                return undefined;
            }
        },

        pgv_3d_data: function() {
            let ret_val = undefined;
            
            if (this.active_event) {
                ret_val = this.active_event.pgv_3d;
            }
            return ret_val;
        },

        plotly_data: function() {
            let data = [];
            let trace = {};
            let trace_pgv_3d = {};

            let x_data = [];
            let y_data = [];

            let d3_colors = Plotly.d3.scale.category10();
            if (this.pgv_data) {
                let pgv_data = this.pgv_data;
                let hypo_dist = pgv_data.hypo_dist;

                if (this.is_sprengung_duernbach) {
                    let stations_list = ['MSSNet:DUBA:00',
                                         'MSSNet:DUBAM:00',
                                         'MSSNet:WADE:00',
                                         'MSSNet:WAPE:00',
                                         'MSSNet:HOPO:00',
                                         'MSSNet:HOWA:00',
                                         'MSSNet:RETA:00',
                                         'MSSNet:MIBA:00',
                                         'MSSNet:MAPI:00',
                                         'MSSNet:GRBA:00'];
                    
                    for (let k = 0; k < stations_list.length; k++) {
                        let cur_nsl = stations_list[k];
                        let match_ind = pgv_data.nsl.indexOf(cur_nsl);
                        this.logger.debug("match_ind: ", match_ind);
                        if (match_ind >= 0) {
                            x_data.push(pgv_data.nsl[match_ind]);
                            y_data.push(pgv_data.pgv[match_ind]);
                        }
                        else {
                            x_data.push(cur_nsl);
                            y_data.push(undefined);
                        }
                    }
                }
                else if (hypo_dist.length > 0) {
                    // Sort the data according to the hypo distance.
                    // Create an index mapping of the hypo_dist array.
                    let sort_map = hypo_dist.map(function(x, k) {
                        return {index: k, value: x};
                    });

                    // Sort the map according to the valie.
                    sort_map.sort(function(a, b) {
                        return (a.value > b.value) ?1:-1;
                    });

                    // Sort the nsl and pgv using the sorted sort_map index.
                    x_data = sort_map.map(function(x) {
                        return pgv_data.nsl[x.index];
                    });
                    y_data = sort_map.map(function(x) {
                        return pgv_data.pgv[x.index];
                    });
                }
                else {
                    x_data = pgv_data.nsl;
                    y_data = pgv_data.pgv;
                }
            }

            // Copy the sorted nsl for later use.
            let nsl_sorted = x_data.slice();
            
            // Get the stationname only.
            for (let k = 0; k < x_data.length; k++) {
                let comps = x_data[k].split(':');
                x_data[k] = comps[1];
            }

            // Convert the PGV data to mm/s.
            y_data = y_data.map(function(x) {return x * 1000});

            this.logger.debug('colors: ', d3_colors(0));
           
            trace = {
                x: x_data,
                y: y_data,
                name: 'PGV',
                mode: 'markers',
                type: 'scatter',
                marker: { size: 10,
                          color: d3_colors(0)
                        },
                hovertemplate: '%{x}<br>' +
                               '%{y:.3f} mm/s' +
                               '<extra></extra>'
            }

            // Create the PGV-3D data if available.
            x_data = []
            y_data = []
            if (this.pgv_3d_data) {
                let pgv_3d = this.pgv_3d_data;

                // Loop over the pgv array to make sure, that the initial
                // sorting of the stations is used.
                for (let k = 0; k < nsl_sorted.length; k++) {
                    let nsl = nsl_sorted[k];
                    this.logger.debug('nsl:', nsl);
                    this.logg
                    let cur_pgv = undefined;
                    let stat_name = nsl.split(':')[1];
                    
                    if (pgv_3d.hasOwnProperty(nsl)) {
                        cur_pgv = pgv_3d[nsl];
                        // Convert the pgv data to mm/s;
                        cur_pgv = cur_pgv * 1000;
                    }
                    
                    x_data.push(stat_name);
                    y_data.push(cur_pgv);
                }

                trace_pgv_3d = { x: x_data,
                                 y: y_data,
                                 name: 'PGV-3D',
                                 mode: 'markers',
                                 type: 'scatter',
                                 marker: { size: 10,
                                           color: d3_colors(1)
                                         },
                                 hovertemplate: '%{x}<br>' +
                                                '3D: %{y:.3f} mm/s' +
                                 '<extra></extra>'
                               }
            }

            if (trace_pgv_3d) {
                data = [trace_pgv_3d, trace];
            }
            else {
                data = [trace]
            }
            return data;
        },

    },
    methods: {
        new_plot() {
            Plotly.newPlot(this.element_id, this.plotly_data, this.layout, this.config);
        },

        update() {
            this.logger.debug('Updating Graph ' + this.element_id);
            if (this.plotly_data.length > 0) {
                var element_exists = !!document.getElementById(this.element_id);
                if (element_exists)
                {
                    // The performance of Plotly.react is very poor. Try to find another solution.
                    Plotly.react(this.element_id, this.plotly_data, this.layout, this.config);
                }
            }
        },

        update_range() {
            this.logger.debug('Updating the range.' + this.display_range);
            this.layout.xaxis.range = this.display_range;
            Plotly.relayout(this.element_id, this.layout);
        },

        on_resize() {
            this.logger.debug('Resizing diagram ' + this.element_id);
            this.logger.debug('pgv_axes height:' + this.$refs.diagram_pgv_axes.clientHeight);
            this.logger.debug('pgv_axes width:' + this.$refs.diagram_pgv_axes.clientWidth);
            let update = {
                height: this.$refs.diagram_pgv_axes.clientHeight,
                width: this.$refs.diagram_pgv_axes.clientWidth,
            };
            Plotly.relayout(this.element_id, update);
        },
    }
}

</script>

<style scoped lang="sass">
  
div.graph_container 
  margin: 0px
  padding: 0px
  background-color: Azure
  width: 100%
  height: 100%
  overflow: visible
  display: flex
  flex-flow: column
           
  div.diagram_header
    width: 100%
    padding-left: 5px
    padding-right: 5px
    background-color: white

    .title
      font-weight: bold
                      
  div.diagram_pgv_axes 
    margin: 0px
    padding: 0px
    background-color: Grey
    width: 100%
    height: 100%
    overflow: hidden
            
</style>
