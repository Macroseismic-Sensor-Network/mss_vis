<template>
    <div class="graph_container">
        <div class="station_label_container">
            <span class="station_label">{{ station }}</span>
        </div>
        <div class="pgv_axes" v-bind:id="element_id">
        </div>
    </div>
</template>


<script>
import Plotly from 'plotly.js/dist/plotly'

export default {
    name: 'PGVGraph',

    props: {
        stream_id: String
    },

    data: function () {
        return {
            layout: {
                //title: this.stream_id,
                //titlefont: {size: 10},
                margin: {
                    l: 2,
                    r: 2,
                    t: 2,
                    b: 2
                },
                xaxis: {
                    type: 'date',
                    range: ['2019-07-05T11:00:00', '2019-07-05T13:00:00'],
                    autorange: false,
                    fixedrange: true,
                    showticklabels: false,
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
                    showticklabels: false,
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
                ]
            },

            config: {
                responsive: true
            }
        }
    },

    computed: {
        pgv_data: function() {
            return this.$store.getters.pgv_by_station(this.$props.stream_id);
        },

        plotly_data: function() {
            var pgv_data = this.$store.getters.pgv_by_station(this.$props.stream_id);
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
            var data = [trace, ]
            return data;
        },

        element_id: function() {
            return 'pgv_graph_' + this.stream_id;
        },

        display_range: function() {
            return this.$store.getters.display_range;
        },

        station: function() {
            var res = this.stream_id.split('.');
            return res[1];
        }

    },

    mounted() { 
        this.new_plot();
    },

    created() {
        this.$watch('plotly_data', this.update);
        this.$watch('display_range', this.update);
    },

    methods: {
        new_plot() {
            //this.layout.xaxis.range = ['2019-07-05T11:30:00', this.$store.getters.max_datetime]
            Plotly.newPlot(this.element_id, this.plotly_data, this.layout, this.config);
        },

        update() {
            //var layout = this.layout;
            //this.layout.xaxis.range = ['2019-07-05T11:30:00', '2019-07-05T14:00']
            this.layout.xaxis.range = this.$store.getters.display_range;
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
                Plotly.react(this.element_id, this.plotly_data, this.layout, this.config);
            }
        },

        update_range() {
            console.log('Updating the range.');
        }
    }
}
</script>


<style scoped>
div.graph_container {
    display: inline-block;
    margin: 0px;
    padding: 0px;
    background-color: Azure;
    width: 90%;
    height: 100px;
    overflow: hidden;
}

div.station_label_container {
    float: left;
    padding: 0px;
    background-color: FloralWhite;
    overflow: hidden;
    width: 100px;
    height: 100%;
    display: flex;
    display: -webkit-flex;
    vertical-align: middle;
}

span.station_label {
    margin: auto;
    font-weight: bold;
}

div.pgv_axes {
    margin-left: 100px;
    padding: 0px;
    background-color: Red;
    height: 100%;
    overflow: hidden;
}
</style>
