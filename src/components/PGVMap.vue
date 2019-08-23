<template>
    <div id="mapcontainer">
        <!--<svg id="map" viewBox="0 0 4000 2500" preserveAspectRatio="xMidYMid slice">-->
        <div id="map_info">last data: {{ data_time_range[1] }} UTC<br>
                           first data: {{ data_time_range[0] }} UTC<br>
                           server state: {{ server_state }}</div>
        <svg id="map"
             width="100%"
             height="100%"
             viewBox="0 0 4000 2500"
             preserveAspectRatio="xMidYMid meet">
            <PGVMapMarker v-for="cur_station in stations" 
                          v-bind:key="cur_station.id"
                          v-bind:station_id="cur_station.id"
                          v-bind:x_utm="cur_station.x_utm"
                          v-bind:y_utm="cur_station.y_utm"/>

            <PGVLegend name="map_legend"/>
        </svg>
    </div>
</template>


<script>
import PGVMapMarker from '../components/PGVMapMarker.vue'
import PGVLegend from '../components/PGVLegend.vue'
import * as d3 from "d3";

export default {
    name: 'PGVMap',

    props: {
        title: String,
    },

    components: {
        PGVMapMarker,
        PGVLegend,
    },

    data() {
        return {
            map_image: 'undefined',
            map_image_url: '/assets/vue/image/mss_map_with_stations.jpg',
        };
    },

    created() {
    },

    mounted() {
        this.map_image = new Image;
        this.init_map();
        //window.addEventListener('resize', this.on_resize);
        //this.$watch('radius', this.plot_stations);
        this.$store.commit("LOAD_STATION_METADATA");
    },

    computed: {
        data_time_range: function() {
            return this.$store.getters.data_time_range;
        },

        server_state: function() {
            return this.$store.getters.server_state;
        },

        stations: function() {
            return this.$store.getters.station_meta;
        },

        scales: function() {
            return this.$store.getters.scales;
        },
    },

    methods: {
        init_map() {
            this.show_image();
            //this.on_resize();
        },

        calculate_path() {
            const scale = this.get_scales();
            const path = d3.line()
                .x((d, i) => scale.x(i))
                .y(d => scale.y(d));
            this.line = path(this.data)
        },

        show_image() {
            let self = this;
            var map_svg = d3.select("#map");
            this.map_image.onload = function()
            {
                console.log("Image loaded.")
                map_svg.append("svg:image")
                    .attr('width', 4000)
                    .attr('height', 2500)
                    .attr('id', 'map_image')
                    .attr("xlink:href", self.map_image_url);
                d3.select('#map_image').lower();
            }
            console.log("Loading map image: " + this.map_image_url);
            this.map_image.src = this.map_image_url;
        },

        on_resize() {
            var map_container = d3.select("#mapcontainer").node();
            var map_svg = d3.select("#map");
            const width = map_container.clientWidth;
            const height = map_container.clientHeight;
            console.log("w: " + width + " h: " + height);
            map_svg.attr("width", width)
                   .attr("height", height);
            //const scale = height / this.map_image.height;

            //const map_image = d3.select("#map_image");
            //map_image
            //    .attr('width', this.map_image.width * scale)
            //    .attr('height', this.map_image.height * scale)
        }
    },
}
</script>


<style scoped lang="sass">

div#mapcontainer
    height: 100%;
    position: relative;
    //top: 0;
    //left: 0;
    //right: 0;
    //bottom: 0;

div#map_info
    width: 100%;
    position: absolute;
    text-align: right;
    font-size: 10pt;
    //background-color: #ff0000;
    //opacity: 0.3;

svg#map
    border: none;
</style>
