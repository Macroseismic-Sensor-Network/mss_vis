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
            layout: {
                margin: {
                    l: 2,
                    r: 2,
                    t: 2,
                    b: 2,
                },
                xaxis: {
                    type: 'station',
                    autorange: true,
                    fixedrange: false,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    mirror: 'ticks',
                    showline: true,
                    ticks: 'inside',
                    zeroline: false,
                },
                yaxis: {
                    type: 'log',
                    autorange: true,
                    showticklabels: true,
                    ticklabelposition: 'inside',
                    showline: true,
                    mirror: 'ticks',
                    ticks: 'inside',
                    zeroline: false
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
                for (let k = 0; k < pgvstation.features.length; k++) {
                    let feature = pgvstation.features[k];
                    nsl.push(feature.properties.nsl);
                    pgv.push(feature.properties.pgv);
                }
                ret['nsl'] = nsl;
                ret['pgv'] = pgv;
                return ret;
            }
            else {
                return undefined;
            }
        },

        plotly_data: function() {
            let data = [];
            let trace = {};

            let x_data = [];
            let y_data = [];
            if (this.pgv_data) {
                x_data = this.pgv_data.nsl
                y_data = this.pgv_data.pgv
            }
           
            trace = {
                x: x_data,
                y: y_data,
                mode: 'markers',
                type: 'scatter'
            }

            data = [trace, ]
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

<style scoped>
div.graph_container {
    margin: 0px;
    padding: 0px;
    background-color: Azure;
    width: 100%;
    height: 100%;
    overflow: visible;
}

div.diagram_pgv_axes {
    margin: 0px;
    padding: 0px;
    background-color: Grey;
    height: 100%;
    width: 100%;
    overflow: hidden;
}
</style>
