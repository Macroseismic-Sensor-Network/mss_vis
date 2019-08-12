<template>
  <div id="app">
    <WebSocketDisplay title="Display of data received from websocket."/>
  </div>
</template>

<script>
import WebSocketDisplay from './components/WebSocketDisplay.vue'

export default {
    name: 'app',

    components: {
        WebSocketDisplay
    },

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
