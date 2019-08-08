<template>
    <li v-bind:id="element_id">
        <b>{{ station_name }}:</b>
        <p>latest pgv: {{ current_pgv }}</p>
        <p>data length: {{ data_length }}</p>
    </li>
</template>


<script>
export default {
    name: 'PGVDisplay',
    props: {
        station_name: String,
    },
    computed: {
        current_pgv: function() {
            return this.$store.getters.current_pgv_by_station(this.$props.station_name);
        },

        element_id: function() {
            return 'pgv_disp_' + this.station_name;
        },

        data_length: function() {
            return this.$store.getters.data_length(this.$props.station_name);
        },
    }
}
</script>


<style scoped>
li {
    display: inline-block;
    margin: 0 10px;
    padding: 10px;
    background-color: DarkSeaGreen;

}
</style>
