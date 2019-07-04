<template>
    <div class="hello">
        <h1>{{ title }}</h1>
        <h2> Current PGV data </h2>
        <ul>
            <PGVDisplay v-for="(cur_pgv, cur_name, cur_ind) in current_pgv" v-bind:station_name="cur_name" />
        </ul>
        <ul>
            <li v-for="(cur_pgv, cur_name, cur_ind) in current_pgv">
                <b>{{ cur_name }}:</b>
                <p>pgv: {{ cur_pgv }}</p>
            </li>
        </ul>

        <div v-for="(cur_pgv, cur_name, cur_ind) in pgv_value" v-bind:id="cur_name">
            <b>{{ cur_name }}</b>
        </div>

        <h2> All available PGV data </h2>
        <ul>
            <li v-for="(cur_pgv, cur_name, cur_ind) in pgv_value">
                <b>{{ cur_name }}:</b>
                <p>time: {{ cur_pgv.time }}</p>
                <p>data: {{ cur_pgv.data }}</p>
            </li>
        </ul>
    </div>
</template>

<script>
import Plotly from 'plotly.js/dist/plotly'
import PGVDisplay from '../components/PGVDisplay.vue'

export default {
    name: 'WebSocketDisplay',
    props: {
        title: String
    },
    components: {
        PGVDisplay
    },
    computed: {
        stations: function () {
            return this.$store.state.stations
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
