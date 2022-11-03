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
        <div class="track_timeline_axes"
             v-bind:ref="element_id"
             v-bind:id="element_id"
             v-resize:debounce="on_resize">
        </div>
    </div>
</template>

<script>

import resize from 'vue-resize-directive'
import Plotly from 'plotly.js/dist/plotly'
import * as moment from 'moment';
import * as log from 'loglevel';
import * as log_prefix from 'loglevel-plugin-prefix';
import _ from "lodash"

export default {
    name: 'TrackTimeline',
    props: {
    },
    components: {},
    directives: {
        resize,
    },
    mounted() { 
        this.new_plot();
        //this.update_range();
        this.bind_events();
        this.logger.debug('mounted - rangeslider range: ', this.layout.xaxis.rangeslider.range);
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
                         this.$store.getters.prefix_options);
        this.$watch('plotly_data', this.update);
        //this.$watch('selected_time_range', this.update_range);
    },
    data: function () {
        var self = this;
        let selector_options = {
            buttons: [
                {
                    step: 'month',
                    stepmode: 'backward',
                    count: 1,
                    label: '1m'
                },
                {
                    step: 'all'
                },
            ]
        };
        
        return {
            layout: {
                //title: 'Zeitleiste',
                //titlefont: {size: 10},
                margin: {
                    l: 2,
                    r: 2,
                    t: 2,
                    b: 2
                },
                xaxis: {
                    type: 'date',
                    autorange: false,
                    range: ['2018-01-01', '2019-01-01'],
                    fixedrange: false,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    mirror: 'ticks',
                    showline: true,
                    ticks: 'inside',
                    zeroline: false,
                    hoverformat: '%Y-%m-%d %H:%M:%S',
                    rangeselector: selector_options,
                    rangeslider: {
                        autorange: false
                    }
                },
                yaxis: {
                    type: 'linear',
                    autorange: false,
                    range: [-1, 1],
                    fixedrange: true,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    showline: true,
                    mirror: 'ticks',
                    ticks: 'inside',
                    zeroline: true,
                },
            },
            
            config: {
                displayModeBar: false,
                modeBarButtonsToAdd: [{
                    name: 'color toggler',
                    // eslint-disable-next-line
                    click: function(gd) {
                            self.logger.debug('Clicked custom plotly button.')
                    },
                }]
            }
        }
    },
    computed: {
        element_id: function() {
            return 'track_overview_timeline';
        },

        dom_element: function() {
            return this.$refs[this.element_id];
        },
        
        filtered_events: function() {
            return this.$store.getters.filtered_events;
        },

        utc_offset: function() {
            return this.$store.getters.utc_offset;
        },

        colormap: function() {
            let domain = ['undefiniert', 'störsignal', 'sprengung', 'erdbeben']
            let cmap = this.$store.getters.colormap_categorical;
            cmap.domain(domain);
            return cmap;
        },
        
        plotly_data: function() {
            var data = [];
            var trace = {};

            let data_time = [];
            let data_marker = [];
            let marker_text = [];
            let color = [];
            let event_type = [];
            for (let cur_key in this.filtered_events)
            {
                let cur_event = this.filtered_events[cur_key]
                //let cur_start = moment.utc(cur_event.start_time).valueOf();
                let cur_start = this.utc_to_local_time(moment.utc(cur_event.start_time));
                cur_start = cur_start.toISOString(true);
                let cur_marker = 0;
                let cur_pub_id = cur_event.public_id;
                let cur_event_type = cur_event.event_class;
                data_time.push(cur_start);
                data_marker.push(cur_marker);
                marker_text.push(cur_pub_id);
                color.push(this.colormap(cur_event_type));
                event_type.push(cur_event_type);
            }
            
            
            trace = {
                x: data_time,
                y: data_marker,
                text: marker_text,
                type: 'scatter',
                mode: 'markers',
                meta: event_type,
                hovertemplate: '%{text}<br>%{meta}<extra></extra>',
                marker: {
                    color: color,
                },
            }
            
            data = [trace, ]
            return data;
        },

        archive_time_range: function() {
            return this.$store.getters.archive_full_time_range;
        },

        selected_time_range: function() {
            return this.$store.getters.archive_selected_time_range;
        },

        resize_toggle: function() {
            return this.$store.getters.tracks.resize_toggle;
        },
    },
    methods: {
        new_plot() {
            let range = [this.selected_time_range[0].toISOString(),
                         this.selected_time_range[1].toISOString()]
            this.layout.xaxis.range = range;

            let end_time = moment(this.archive_time_range[1]);
            end_time.add(30, 'days');
            range = [this.archive_time_range[0].toISOString(),
                     end_time.toISOString()];
            this.layout.xaxis.rangeslider.range = range;
            
            Plotly.newPlot(this.element_id, this.plotly_data, this.layout, this.config);
        },

        update() {
            this.logger.debug('Updating Graph ' + this.element_id);
            //var layout = this.layout;
            //this.layout.xaxis.range = ['2019-07-05T11:30:00', '2019-07-05T14:00']
            //this.layout.xaxis.range = this.display_range;
            //let range = [this.selected_time_range[0].toISOString(),
            //             this.selected_time_range[1].toISOString()]
            //this.layout.xaxis.rangeslider.range = range;

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
            let range = [this.selected_time_range[0].toISOString(),
                         this.selected_time_range[1].toISOString()]
            this.logger.debug('Updating the range.', range);
            this.layout.xaxis.range = range;            
            Plotly.relayout(this.element_id, this.layout);
        },

        update_selected_range() {
            this.logger.debug('Updating the selected range: ', this.selected_time_range);
        },

        on_resize() {
            this.logger.debug('Resizing track ' + this.element_id);
            this.logger.debug('timeline height:' + this.dom_element.clientHeight);
            this.logger.debug('timeline width:' + this.dom_element.clientWidth);
            let update = {
                height: this.dom_element.clientHeight,
                width: this.dom_element.clientWidth,
            };
            Plotly.relayout(this.element_id, update);
        },

        bind_events() {
            this.dom_element.on('plotly_relayout', this.on_plotly_relayout);
        },

        on_plotly_relayout: _.debounce(function() {
            this.logger.debug('plotly_relayout');
            this.logger.debug('layout.xaxis.range: ', this.layout.xaxis.range);
            this.logger.debug('layout.xaxis.rangeslider.range: ', this.layout.xaxis.rangeslider.range);
            // Set the selected time range in the store.
            let payload = {
                start_time: moment.utc(this.layout.xaxis.range[0]),
                end_time: moment.utc(this.layout.xaxis.range[1])
            }
            this.$store.commit('set_selected_time_range', payload);                     
        }, 300),

        utc_to_local_time(time_utc) {
            let time_local = time_utc.utcOffset(this.utc_offset / 60);
            return time_local;
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
                      
  div.track_timeline_axes 
    margin: 0px
    padding: 0px
    background-color: Grey
    width: 100%
    height: 100%
    overflow: hidden
                      
</style>
