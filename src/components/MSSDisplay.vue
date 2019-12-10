<template>
    <div id="mss-display-containter">
        <div id="map-container" class = "grid-x">
            <div class="cell"><PGVMap /></div>
        </div>
    </div>
</template>

<script>

import PGVMap from '../components/PGVMap.vue'

export default {
    name: 'MSSDisplay',
    props: {
        title: String
    },
    components: {
        PGVMap,
    },
    computed: {
        stations: function() {
            return this.$store.getters.station_meta;
        },

    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
