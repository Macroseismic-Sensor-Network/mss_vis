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
            data: [99, 71, 78, 25, 36, 92],
            line: '',
            map_image: 'undefined'
        };
    },

    mounted() {
        this.map_image = new Image;
        this.show_image();
        window.addEventListener('resize', this.on_resize);
    },

    computed: {
        display_range: function() {
            return this.$store.getters.display_range;
        },

        // Use a computed attribute for the map url to make sure, that
        // the correct assets path is returned.
        // See https://vuejs-templates.github.io/webpack/static.html#getting-asset-paths-in-javascript
        map_image_url: function() {
            return require('../assets/mss_map.png');
        },
    },

    methods: {
        get_scales() {
            const x = d3.scaleTime().range([0, 430]);
            const y = d3.scaleLinear().range([210, 0]);
            d3.axisLeft().scale(x);
            d3.axisTop().scale(y);
            x.domain(d3.extent(this.data, (d, i) => i));
            y.domain([0, d3.max(this.data, d => d)]);
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
                    .attr('width', 600)
                    .attr('height', 600)
                    .attr('id', 'map_image')
                    .attr("xlink:href", self.map_image_url);
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
            //context.drawImage(this.map_image, 0, 0, this.map_image.width * scale, this.map_image.height * scale);
        }
    },
}
</script>


<style scoped lang="sass">

div#mapcontainer
    width: 100%
    height: 700px

svg#map
    border: solid 2px black
    width: 700px
    height: 700px

</style>
