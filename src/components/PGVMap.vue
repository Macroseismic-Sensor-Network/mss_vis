<template>
    <div id="mapcontainer">
        <!--<svg id="map" viewBox="0 0 4000 2500" preserveAspectRatio="xMidYMid slice">-->
        <svg id="map"
             width="100%"
             height="100%"
             viewBox="0 0 4000 2500"
             preserveAspectRatio="xMidYMid meet">
            <PGVMapMarker v-for="cur_station in stations" 
                          v-bind:key="cur_station.id"
                          v-bind:station_id="cur_station.id"
                          v-bind:x_utm="cur_station.x_utm"
                          v-bind:y_utm="cur_station.y_utm"
                          :map_limits="map_limits"
                          :map_size="map_size"
                          :radius_limits="marker_radius_limits"
                          :pgv_limits="pgv_limits"/>

            <PGVLegend name="map_legend"
                       :pgv_values="legend_values"
                       :radius_limits="marker_radius_limits"
                       :map_limits="map_limits"
                       :pgv_limits="pgv_limits"
                       :position="{x: 100, y: 100}"/>
        </svg>
    </div>
</template>


<script>
import PGVMapMarker from '../components/PGVMapMarker.vue'
import PGVLegend from '../components/PGVLegend.vue'
import * as d3 from "d3";

export default {
    name: 'PGVMapSvg',

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
            map_image_url: '/image/mss_map_with_stations.jpg',
            map_limits: {'x_min': 519685.529,
                         'y_min': 5252085.484,
                         'x_max': 672085.529,
                         'y_max': 5347335.484},
            map_size: {'width': 4000,
                       'height': 2500},
            legend_values: [1e-5, 3e-5, 1e-4, 3e-4, 1e-3, 3e-3, 1e-2],
            marker_radius_limits: [5, 40],
            pgv_limits: [1e-6, 1e-1],
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
        display_range: function() {
            return this.$store.getters.display_range;
        },

        stations: function() {
            return this.$store.getters.station_meta;
        },
    },

    methods: {
        init_map() {
            this.show_image();
            //this.on_resize();
        },

        plot_stations() {
            console.log('Plotting stations.');
            const map_svg = d3.select("#map");

            var scales = this.get_scales();

            map_svg.selectAll("circle").remove();

            map_svg.selectAll("circle")
                   .data(this.stations)
                   .enter()
                   .append("circle")
                        .attr("cx", function(d) { return scales.x(d.x_utm);})
                        .attr("cy", function(d) { return scales.y(d.y_utm);})
                        .attr("r", this.radius)
                        .attr('fill', 'orange')
                        .attr('stroke', 'black')
                        .attr('id', function(d) { return d.id;});
        },

        get_scales() {
            const x = d3.scaleLinear().domain([this.map_limits.x_min, 
                                                this.map_limits.x_max])
                                       .range([0, 1920]);
            const y = d3.scaleLinear().domain([this.map_limits.y_min,
                                                this.map_limits.y_max])
                                       .range([1080, 0]);
            return {x, y};
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

svg#map
    border: solid 2px black
</style>
