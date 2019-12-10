// Vue configuration
//const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    publicPath: "./",
    assetsDir: "assets/vue",
    pages: {
        index: {
            entry: 'src/main.js',
        },
        mss_ntr_ts: {
            entry: 'src/mss_nrt_ts/main.js',
            template: 'public/mss_nrt_ts.html',
        }
    },
    configureWebpack: {

        resolve: {
            alias: {
                vue$: 'vue/dist/vue.esm.js'
            },
            extensions: ['*', '.js', '.vue', '.json']
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: '_includes/vue/vue_scripts.html',
                template: 'src/templates/scripts.html',
                inject: false,
            }),
            new HtmlWebpackPlugin({
                filename: '_includes/vue/vue_css.html',
                template: 'src/templates/css.html',
                inject: false,
            }),
        ],
    },

    /*
    chainWebpack: webpackConfig => {
        if (process.env.NODE_ENV === 'production') {
            const assets_path = 'assets/vue';
            webpackConfig
                .output
                .filename(path.join(assets_path, 'js/[name].[chunkhash:8].js'))
                .chunkFilename(path.join(assets_path, 'js/chunk[id].[chunkhash:8].js'))
        }
    },*/
};
