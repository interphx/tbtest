'use strict';

var path              = require('path'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    UglifyJsPlugin    = require('webpack').optimize.UglifyJsPlugin,
    HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => ({
    context: path.join(__dirname, 'src/client'),
    entry: './app.tsx',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist/static')
    },
    plugins: [
        new CopyWebpackPlugin([
            { 
                from: 'static/**/*',
                to: '../'
            }
        ], {
            copyUnmodified: true
        }),
        new HtmlWebpackPlugin({
            title: 'TurnBasedTester',
            template: 'templates/index.html.ejs'
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: path.join(__dirname, 'node_modules')
            }
        ]        
    },
    resolve: {
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    }
});