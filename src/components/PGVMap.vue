<template>
    <div id="mapcontainer">
        <canvas id="map">
        </canvas>
    </div>
</template>


<script>
import * as d3 from "d3";

export default {
    name: 'PGVMap',

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
            var canvas = d3.select("#map");
            const context = canvas.node().getContext("2d");
            const window = d3.select(window);
            console.log("Canvas: " + canvas);
            console.log("context: " + context);
            let self = this;
            this.map_image.onload = function()
            {
                console.log("Image loaded.")
                self.on_resize();
            }
            this.map_image.src = this.map_image_url;
        },

        on_resize() {
            var map_container = d3.select("#mapcontainer").node();
            var canvas = d3.select("#map");
            const context = canvas.node().getContext("2d");
            const width = map_container.clientWidth;
            const height = map_container.clientHeight;
            console.log("w: " + width + " h: " + height);
            canvas.attr("width", width)
                  .attr("height", height);
            //context.drawImage(this.map_image, 0, 0);
            const scale = height / this.map_image.height;
            context.drawImage(this.map_image, 0, 0, this.map_image.width * scale, this.map_image.height * scale);
        }
    },
}
</script>


<style scoped lang="sass">

div#mapcontainer
    width: 100%
    height: 700px

canvas#map
    border: solid 2px black

</style>
