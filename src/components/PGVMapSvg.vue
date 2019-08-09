<template>
    <div id="mapcontainer">
        <svg id="map">
        </svg>
    </div>
</template>


<script>
import * as d3 from "d3";

export default {
    name: 'PGVMapSvg',

    props: {
        title: String,
    },

    data() {
        return {
            stations_dev: [
                        {name: "S1", x: 100, y: 10},
                        {name: "S2", x: 300, y: 30},
                        {name: "S3", x: 600, y: 60},
                      ], 
            line: '',
            map_image: 'undefined',
            map_image_url: '/image/mss_map.png',
            map_limits: {'x_min': 527917.249,
                         'y_min': 5262635.008,
                         'x_max': 657965.249,
                         'y_max': 5335787.008},
            stations: [],
            dataset: [10, 20, 30, 40, 50],
            radius: 4,
        };
    },

    created() {
        const self = this;
        d3.csv("/data/mss_stations_2019_147.csv").then( function(data) {
            //console.log(data);
            //console.log("Length: " + data.length);
            self.stations = data;
            console.log("Data loaded.");
            self.plot_stations();
        });
    },

    mounted() {
        this.map_image = new Image;
        this.init_map();
        window.addEventListener('resize', this.on_resize);
        this.$watch('radius', this.plot_stations);
    },

    computed: {
        display_range: function() {
            return this.$store.getters.display_range;
        },
    },

    methods: {
        init_map() {
            this.show_image();
            this.on_resize();
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
                        .attr('stroke', 'black');
        },

        get_scales() {
            const x = d3.scaleLinear().domain([this.map_limits.x_min, 
                                                this.map_limits.x_max])
                                       .range([0, 1280]);
            const y = d3.scaleLinear().domain([this.map_limits.y_min,
                                                this.map_limits.y_max])
                                       .range([720, 0]);
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
                    .attr('width', 1280)
                    .attr('height', 720)
                    .attr('id', 'map_image')
                    .attr("xlink:href", self.map_image_url);
                d3.select('#map_image').lower();
                self.on_resize();
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
            const scale = height / this.map_image.height;

            const map_image = d3.select("#map_image");
            map_image
                .attr('width', this.map_image.width * scale)
                .attr('height', this.map_image.height * scale)
        }
    },
}
</script>


<style scoped lang="sass">

div#mapcontainer
    width: 100%
    height: 720px

svg#map
    border: solid 2px black
    width: 1280px
    height: 720px

</style>
