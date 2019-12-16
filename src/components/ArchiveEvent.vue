<template>
    <div class="archive_event" v-on:click="show_event"><span class="archive_event" v-bind:class="{ active: is_active }" v-bind:style="{backgroundColor: color}">{{ event_id }} ({{ (max_pgv * 1000).toFixed(3) }} mm/s)</span><br></div>
</template>


<script>

export default {
    name: 'ArchiveEvent',

    props: {
        id: String,
        pos: Number,
    },

    computed: {
        event_id: function() {
            return this.id.slice(0, -7);
        },

        max_pgv: function() {
            return this.$store.getters.archive_event_max_pgv(this.pos);
        },

        color: function() {
            return this.pgv_to_color(this.max_pgv);
        },

        current_event: function() {
            return this.$store.getters.event_archive[this.pos];
        },

        scales: function() {
            return this.$store.getters.scales;
        },

        is_active: function() {
            var active_event_pos = this.$store.getters.map_control.show_archive_event;

            if (this.pos === active_event_pos)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    },

    methods: {
        show_event()
        {
            console.log("Showing event: " + this.pos);
            var payload = { pos: this.pos };
            this.$store.commit('set_show_archive_event', payload);
        },

        pgv_to_color(pgv) {
            // Convert the PGV value [m/s] to a color value.
            const colormap = this.$store.getters.map_config.colormap;
            var color = colormap(this.scales.color(pgv));
            return color;
        },
    },
}
</script>


<style scoped lang="sass">

div.archive_event
    margin-bottom: 5px

span.archive_event
    cursor: pointer
    margin-bottom: 5px
    padding: 2px
    border-radius: 4px

span.archive_event:hover
    background-color: LightBlue !important

span.active
    background-color: LightBlue !important


</style>
