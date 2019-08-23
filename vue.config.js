// Vue configuration

module.exports = {
    publicPath: "./",
    configureWebpack: {
        resolve: {
            alias: {
                vue$: 'vue/dist/vue.esm.js'
            },
            extensions: ['*', '.js', '.vue', '.json']
        },
    },
};
