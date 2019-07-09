<template>
    <div class="hello">
        <h1>{{ title }}</h1>
        <h2> Current PGV data </h2>
        <ul>
            <PGVDisplay v-for="cur_stream in streams" v-bind:station_name="cur_stream" />
        </ul>

        <h2> PGV graphs </h2>
        <PGVGraph v-for="cur_stream in streams" v-bind:stream_id="cur_stream" />

        <h2> Station divs </h2>
        <div v-for="(cur_pgv, cur_name, cur_ind) in pgv_value" v-bind:id="cur_name">
            <b>{{ cur_name }}</b>
        </div>
    </div>
</template>

<script>
import PGVDisplay from '../components/PGVDisplay.vue'
import PGVGraph from '../components/PGVGraph.vue'

export default {
    name: 'WebSocketDisplay',
    props: {
        title: String
    },
    components: {
        PGVDisplay,
        PGVGraph
    },
    computed: {
        streams: function () {
            var available_streams = Object.keys(this.$store.state.pgv_data);
            return available_streams.sort();
        },
        pgv_value: function () {
            return this.$store.state.pgv_data
        },
        current_pgv: function () {
            return this.$store.getters.current_pgv
        },
        test: function () {
            var tmp = {}
            console.log("Computing test.")
            //console.log(this.$store.state.stations)
            //tmp.push(this.$store.state.stations.length)
            //console.log(tmp.pop())
            //console.log(tmp)
            for (var key in this.$store.state.pgv_data) {
                var last_ind = this.$store.state.pgv_data[key].data.length - 1
                console.log("key: " + key)
                console.log("last_ind: " + last_ind)
                console.log(this.$store.state.pgv_data[key].data[last_ind])
                tmp[key] = this.$store.state.pgv_data[key].data[last_ind]
            }
            console.log(tmp)
            return tmp
        }
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
</style>
