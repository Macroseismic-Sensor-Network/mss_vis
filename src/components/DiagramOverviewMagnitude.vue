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
  
    <div class="diagram_overview_axes"
         v-bind:ref="element_id"
         v-bind:id="element_id"
         v-resize:debounce="on_resize">
    </div>
  </div>
</template>

<script>

import resize from 'vue-resize-directive'
import * as moment from 'moment';
import Plotly from 'plotly.js/dist/plotly'
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';

export default {
    name: 'DiagramOverviewMagnitude',
    props: {
        parameter: String,
    },
    components: {},
    directives: {
        resize,
    },
    mounted() { 
        this.new_plot();
        this.bind_events();
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
                         this.$store.getters.prefix_options);
        this.$watch('plotly_data', this.update);
        this.$watch('hover_active_event', this.trigger_hover);
        //this.$watch('display_range', this.update_range);
    },
    data: function () {
        return {
            config: {
                displayModeBar: false
            }
        }
    },
    computed: {
        active_event: function() {
            return this.$store.getters.active_recent_event;
        },
        
        element_id: function() {
            return 'diagram_overview_' + this.parameter;
        },

        selected_events: function() {
            return this.$store.getters.selected_events;
        },

        dom_element: function() {
            return this.$refs[this.element_id];
        },

        title: function() {
            let title = undefined;
            
            if (this.parameter === 'magnitude')
                title = 'Magnitude';
            else if (this.parameter === 'pgv')
                title = 'PGV';
                
            return title;
        },

        ylabel: function () {
            let label = undefined;
            
            if (this.parameter === 'magnitude')
                label = 'Magnitude [MSS]';
            else if (this.parameter === 'pgv')
                label = 'PGV [mm/s]';
                
            return label;
        },

        y_axis_type: function() {
            let type = 'linear'
            if (this.parameter === 'pgv')
                type = 'log';

            return type;
        },

        colormap: function() {
            return this.$store.getters.colormap_events;
        },

        hover_active_event: function() {
            return this.$store.getters.hover_active_event;
        },

        layout: function() {
            let layout = {
                dragmode: false,
                margin: {
                    l: 40,
                    r: 2,
                    t: 2,
                    b: 40
                },
                legend: { x: 1,
                          xanchor: 'right',
                          y: 1
                        },
                xaxis: {
                    type: 'category',
                    autorange: 'reversed',
                    fixedrange: false,
                    showticklabels: false,
                    ticklabelposition: 'inside',
                    mirror: 'ticks',
                    showline: true,
                    ticks: 'inside',
                    zeroline: false,
                    title: { text: 'Ereignis',
                       },
                },
                yaxis: {
                    type: this.y_axis_type,
                    autorange: true,
                    rangemode: 'tozero',
                    fixedrange: false,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    showline: true,
                    mirror: 'ticks',
                    ticks: 'inside',
                    zeroline: true,
                    title: { text: this.ylabel,
                           },
                },
            }
            return layout;
        },
        
        event_data: function() {
            let data_time = [];
            let data_mag = [];
            let data_pgv = [];
            let data_pubid = [];
            let event_type = [];
            let color = [];
            for (let cur_key in this.selected_events)
            {
                let cur_event = this.selected_events[cur_key];
                let cur_start = moment.utc(cur_event.start_time).valueOf();
                let cur_mag = cur_event.magnitude;
                let cur_pgv = cur_event.max_pgv * 1000;
                let cur_pub_id = cur_event.public_id;
                let cur_event_type = cur_event.event_class;
                data_time.push(cur_start);
                data_mag.push(cur_mag);
                data_pgv.push(cur_pgv);
                data_pubid.push(cur_pub_id);
                event_type.push(cur_event_type);
                color.push(this.colormap(cur_event_type));
            }
            return {time: data_time,
                    mag: data_mag,
                    pgv: data_pgv,
                    pub_id: data_pubid,
                    event_type: event_type,
                    color: color};
        },

        plotly_data: function() {
            let data = [];
            let trace = {};

            let x_data = [];
            let y_data = [];

            //let d3_colors = Plotly.d3.scale.category10();

            x_data = this.event_data.pub_id;

            if (this.parameter === 'magnitude') {
                y_data = this.event_data.mag;
            }
            else if (this.parameter === 'pgv') {
                y_data = this.event_data.pgv;
            }
            
            trace = {
                x: x_data,
                y: y_data,
                name: this.parameter,
                mode: 'markers',
                type: 'scatter',
                marker: {
                    color: this.event_data.color,
                    size: 7,
                },
                hovertemplate: '%{y}<extra></extra>'
            }
            
            data = [trace]
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

        on_resize() {
            let update = {
                height: this.dom_element.clientHeight,
                width: this.dom_element.clientWidth,
            };
            Plotly.relayout(this.element_id, update);
        },

        bind_events() {
            this.dom_element.on('plotly_hover', this.hover);
        },

        hover(event_data) {
            //this.logger.debug('hover', event_data);
            let public_id = event_data.points[0].x;

            if (this.hover_active_event != public_id) {
                let payload = {
                    public_id: public_id
                }
                this.$store.commit('set_hover_active_event', payload);
            }
        },

        trigger_hover() {
            let point_number = this.event_data.pub_id.indexOf(this.hover_active_event);
            Plotly.Fx.hover(this.element_id, [
                {
                    curveNumber: 0,
                    pointNumber: point_number,
                }
            ]);
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
  height: 50%
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
                      
  div.diagram_overview_axes 
    margin: 0px
    padding: 0px
    background-color: Grey
    width: 100%
    height: 100%
    overflow: hidden
            
</style>
