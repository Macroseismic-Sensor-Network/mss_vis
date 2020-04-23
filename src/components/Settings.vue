
<template>
    <div id="settings_container">
        <button id="btn_open_settings" v-on:click="activate_settings()" v-if="!settings.show_settings" width="50px" height="50px">
            Settings
        </button>

        <div id="settings" v-if="settings.show_settings">
            <h1>Einstellung</h1>

            <button id="btn_close_settings" v-on:click="close_settings()">
                Close
            </button>


        </div>
    </div>

</template>

<script>
import $ from 'jquery';	

export default {
    name: "Settings",

    props: {

    },

    created() {
    },

    data() {
        return {

        }
    },

    mounted() {
        this.settings=$.extend(true,{},this.$store.getters.settings);
    },

    methods: {
        activate_settings() {
            this.$store.commit("show_settings",true);
            $(".leaflet-control-zoom").css("visibility", "hidden");
            $(".leaflet-control-layers").css("visibility", "hidden");
        },

        close_settings() {
            this.$store.commit("show_settings",false);
            $(".leaflet-control-zoom").css("visibility", "visible");
            $(".leaflet-control-layers").css("visibility", "visible");
        },


    },
    computed: {
        settings: function() {
            return this.$store.getters.settings;
        },
    },

}
</script>

<style scoped>
#settings {
    background-color:red;
    width:400px;
    height:500px;

}

#btn_open_settings {
    position:absolute;
    margin-left:50px;
    margin-top:25px;
}

#settings_container {
    position:absolute;
    z-index:500;
}
</style>
