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
        <div class="pgv_axes"
             ref="pgv_axes"
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
    name: 'TrackPGV',
    props: {
        stream_id: String,
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
        this.$watch('display_range', this.update_range);
        //this.$watch('resize_toggle', this.on_resize);
    },
    data: function () {
        return {
            layout: {
                //title: this.stream_id,
                //titlefont: {size: 10},
                //margin: {
                //    l: 40,
                //    r: 2,
                //    t: 20,
                //    b: 40
                //},
                margin: {
                    l: 2,
                    r: 2,
                    t: 2,
                    b: 2,
                },
                xaxis: {
                    type: 'date',
                    //range: ['2019-07-05T11:00:00', '2019-07-05T13:00:00'],
                    autorange: false,
                    fixedrange: true,
                    showticklabels: false,
                    ticklabelposition: 'inside',
                    mirror: 'ticks',
                    showline: true,
                    ticks: 'inside',
                    zeroline: false,
                    hoverformat: '%H:%M:%S'
                },
                yaxis: {
                    type: 'log',
                    autorange: false,
                    range: [-4, 1],
                    fixedrange: true,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    showline: true,
                    mirror: 'ticks',
                    ticks: 'inside',
                    zeroline: false
                },
                shapes: [
                    {
                        type: 'rect',
                        xref: 'paper',
                        yref: 'y',
                        x0: 0,
                        x1: 1,
                        y0: 0,
                        y1: 0.1,
                        opacity: 0.1,
                        fillcolor: '#777777',
                        line: {
                            width: 0,
                        }
                    }
                ],
                annotations: [
                    {
                        xref: 'paper',
                        yref: 'paper',
                        x: 0,
                        xanchor: 'left',
                        y: 1,
                        yanchor: 'top',
                        text: 'Station Lable',
                        showarrow: false,
                    },
                ],
            },

            config: {
                //responsive: true
            }
        }
    },
    computed: {
        pgv_data: function() {
            return this.$store.getters.pgv_by_station(this.$props.stream_id);
        },

        plotly_data: function() {
            // eslint-disable-next-line
            var pgv_data = this.$store.getters.pgv_by_station(this.$props.stream_id);
            var data = [];
            if (typeof pgv_data != 'undefined') {
                // Convert to mm/s.
                var data_mm = pgv_data.data.map(function(x) {return x * 1000});
                var trace = {
                    x: pgv_data.time,
                    y: data_mm,
                    type: 'scatter',
                    mode: 'lines',
                    line: {
                        color: 'LightSkyBlue',
                    },
                    fill: 'tozeroy',
                    hovertemplate: 'pgv:  %{y}<br>' +
                                   'time:  %{x}' +
                                   '<extra></extra>',
                }
                data = [trace, ]
            }
            return data;
        },

        element_id: function() {
            return 'pgv_graph_' + this.stream_id;
        },

        display_range: function() {
            return this.$store.getters.display_time_range;
        },

        station: function() {
            var res = this.stream_id.split('.');
            return res[1];
        },

        resize_toggle: function() {
            return this.$store.getters.tracks.resize_toggle;
        },
    },
    methods: {
        new_plot() {
            //this.layout.xaxis.range = ['2019-07-05T11:30:00', this.$store.getters.max_datetime]
            this.layout.annotations[0].text = this.station;
            this.layout.xaxis.range = this.display_range;
            if (Math.max.apply(null, this.plotly_data[0].y) >= 0.1)
            {
                this.plotly_data[0].line.color = 'SandyBrown';
            }
            else
            {
                this.plotly_data[0].line.color = 'LightSkyBlue';
            }
            Plotly.newPlot(this.element_id, this.plotly_data, this.layout, this.config);
        },

        update() {
            console.log('Updating Graph ' + this.element_id);
            //var layout = this.layout;
            //this.layout.xaxis.range = ['2019-07-05T11:30:00', '2019-07-05T14:00']
            //this.layout.xaxis.range = this.display_range;

            if (this.plotly_data.length > 0) {
                if (Math.max.apply(null, this.plotly_data[0].y) >= 0.1)
                {
                    this.plotly_data[0].line.color = 'SandyBrown';
                }
                else
                {
                    this.plotly_data[0].line.color = 'LightSkyBlue';
                }
                var element_exists = !!document.getElementById(this.element_id);
                if (element_exists)
                {
                    // The performance of Plotly.react is very poor. Try to find another solution.
                    Plotly.react(this.element_id, this.plotly_data, this.layout, this.config);
                }
            }
        },

        update_range() {
            console.log('Updating the range.' + this.display_range);
            this.layout.xaxis.range = this.display_range;
            Plotly.relayout(this.element_id, this.layout);
        },

        on_resize() {
            console.log('Resizing track ' + this.element_id);
            console.log('pgv_axes height:' + this.$refs.pgv_axes.clientHeight);
            console.log('pgv_axes width:' + this.$refs.pgv_axes.clientWidth);
            let update = {
                height: this.$refs.pgv_axes.clientHeight,
                width: this.$refs.pgv_axes.clientWidth,
            };
            Plotly.relayout(this.element_id, update);
        },
    }
}

</script>

<style scoped>
div.graph_container {
    margin: 0px;
    padding: 0px;
    background-color: Azure;
    width: 100%;
    height: 100%;
    overflow: visible;
}

div.pgv_axes {
    margin: 0px;
    padding: 0px;
    background-color: Grey;
    height: 100%;
    width: 100%;
    overflow: hidden;
}
</style>
