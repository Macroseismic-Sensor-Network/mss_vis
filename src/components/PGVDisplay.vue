<template>
    <li v-bind:id="station_name">
        <b>{{ station_name }}:</b>
        <p>latest pgv: {{ current_pgv }}</p>
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
            return this.$store.getters.current_pgv_by_station(this.$props.station_name)
        }
    }
}

</script>
