/*****************************************************************************
 * LICENSE
 *
 * This file is part of mss_vis.
 * 
 * If you use mss_vis in any program or publication, please inform and
 * acknowledge its authors.
 * 
 * mss_vis is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * mss_vis is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with mss_vis. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2019 Stefan Mertl
 *****************************************************************************/

// Vue configuration
//const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    publicPath: "./",
    assetsDir: "assets/vue/nrt",
    /*
    pages: {
        index: {
            entry: 'src/main.js',
        },
        mss_ntr_ts: {
            entry: 'src/mss_nrt_ts/main.js',
            template: 'public/mss_nrt_ts.html',
        }
    },
    */
    configureWebpack: {

        resolve: {
            alias: {
                vue$: 'vue/dist/vue.esm.js'
            },
            extensions: ['*', '.js', '.vue', '.json']
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: '_includes/vue/nrt/vue_scripts.html',
                template: 'src/templates/scripts.html',
                inject: false,
            }),
            new HtmlWebpackPlugin({
                filename: '_includes/vue/nrt/vue_css.html',
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
