<template>
    <div v-bind:id="element_id">
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
                    autorange: false
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
                type: 'scatter'
            }
            var data = [trace, ]
            return data;
        },

        element_id: function() {
            return 'pgv_graph_' + this.station_name;
        }
    },

    mounted() { 
        this.new_plot();
    },

    created() {
        this.$watch('plotly_data', this.update);
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
        }
    }
}
</script>


<style scoped>
div {
    display: inline-block;
    margin: 10px;
    padding: 10px;
    background-color: FloralWhite;
    width: 90%;
    height: 200px;
}
</style>
