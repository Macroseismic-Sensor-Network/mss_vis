<template>
    <div class="graph_container">
        <div class="station_label">
            {{ station_name }}
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
        station_name: String
    },

    data: function () {
        return {
            layout: {
                title: this.station_name,
                titlefont: {size: 10},
                margin: {
                    l: 50,
                    r: 50,
                    t: 50,
                    b: 50
                },
                xaxis: {
                    type: 'date',
                    range: ['2019-07-05T11:00:00', '2019-07-05T13:00:00'],
                    autorange: false,
                    fixedrange: true
                },
                yaxis: {
                    fixedrange: true
                }
            },

            config: {
                responsive: true
            }
        }
    },

    computed: {
        pgv_data: function() {
            return this.$store.getters.pgv_by_station(this.$props.station_name);
        },

        plotly_data: function() {
            var pgv_data = this.$store.getters.pgv_by_station(this.$props.station_name);
            var trace = {
                x: pgv_data.time,
                y: pgv_data.data,
                type: 'scatter',
                mode: 'lines',
                fill: 'tozeroy'
            }
            var data = [trace, ]
            return data;
        },

        element_id: function() {
            return 'pgv_graph_' + this.station_name;
        },

        display_range: function() {
            return this.$store.getters.display_range;
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
            Plotly.react(this.element_id, this.plotly_data, this.layout, this.config);
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
    margin: 10px;
    padding: 0px;
    background-color: Azure;
    width: 90%;
}

div.station_label {
    float: left;
    padding: 10px;
    background-color: FloralWhite;
    height: 200px;
    width: 15%;
    overflow: hidden;
}

div.pgv_axes {
    margin-left: 15%;
    padding: 10px;
    background-color: FloralWhite;
    height: 200px;
    overflow: hidden;
}
</style>
