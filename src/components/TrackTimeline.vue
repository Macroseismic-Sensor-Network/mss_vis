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
             ref="timeline_axes"
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
        this.update_range();
    },
    created() {
        this.logger = log.getLogger(this.$options.name)
        this.logger.setLevel(this.$store.getters.log_level);
        log_prefix.apply(this.logger,
                         this.$store.getters.prefix_options);
        this.$watch('plotly_data', this.update);
        this.$watch('display_range', this.update_range);
    },
    data: function () {
        var self = this;
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
                    //range: ['2019-07-05T11:00:00', '2019-07-05T13:00:00'],
                    autorange: false,
                    fixedrange: true,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    mirror: 'ticks',
                    showline: true,
                    ticks: 'inside',
                    zeroline: false,
                    hoverformat: '%H:%M:%S',
                    //title: {text: 'Zeit'}
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
                    //title: {text: 'Ereignis'}
                },
            },
            
            config: {
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
        filtered_events: function() {
            return this.$store.getters.filtered_events;
        },
        
        plotly_data: function() {
            var data = [];
            var trace = {};

            let data_time = [];
            let data_marker = [];
            let marker_text = [];
            for (let cur_key in this.filtered_events)
            {
                let cur_event = this.filtered_events[cur_key]
                let cur_start = moment.utc(cur_event.start_time).valueOf();
                let cur_marker = 0;
                let cur_pub_id = cur_event.public_id
                data_time.push(cur_start);
                data_marker.push(cur_marker);
                marker_text.push(cur_pub_id);
            }
            
            
            trace = {
                x: data_time,
                y: data_marker,
                text: marker_text,
                type: 'scatter',
                mode: 'markers',
            }
            
            data = [trace, ]
            return data;
        },

        element_id: function() {
            return 'tracks_timeline';
        },

        display_range: function() {
            //let range = this.$store.getters.display_time_range;
            //this.logger.debug("range[0]: ", range[0].toISOString());
            //this.logger.debug("range[1]: ", range[1].toISOString());
            //this.logger.debug("server_time: ", this.$store.getters.server_time.toISOString());
            let range_start = moment.utc('2018-01-01');
            let range_end = moment.utc('2022-10-24');
            this.logger.debug("range_start: ", range_start.toISOString());
            this.logger.debug("range_end: ", range_end.toISOString());
            let range = [range_start.valueOf(), range_end.valueOf()];
            return range;
        },

        station: function() {
            var res = this.nsl_code.split(':');
            return res[1];
        },

        resize_toggle: function() {
            return this.$store.getters.tracks.resize_toggle;
        },
    },
    methods: {
        new_plot() {
            Plotly.newPlot(this.element_id, this.plotly_data, this.layout, this.config);
        },

        update() {
            this.logger.debug('Updating Graph ' + this.element_id);
            //var layout = this.layout;
            //this.layout.xaxis.range = ['2019-07-05T11:30:00', '2019-07-05T14:00']
            //this.layout.xaxis.range = this.display_range;

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
            console.log('Resizing track ' + this.element_id);
            console.log('timeline height:' + this.$refs.timeline_axes.clientHeight);
            console.log('timeline width:' + this.$refs.timeline_axes.clientWidth);
            let update = {
                height: this.$refs.timeline_axes.clientHeight,
                width: this.$refs.timeline_axes.clientWidth,
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
                      
  div.track_timeline_axes 
    margin: 0px
    padding: 0px
    background-color: Grey
    width: 100%
    height: 100%
    overflow: hidden
                      
</style>
