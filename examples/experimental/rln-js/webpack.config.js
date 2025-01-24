const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "./index.js",
  },
  experiments: {
    asyncWebAssembly: true,
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      "buffer": require.resolve("buffer/"),
      "process": require.resolve("process/browser"),
      "vm": require.resolve("vm-browserify")
    },
    alias: {
      '@chainsafe/bls-keystore/lib/cipher.js': path.resolve(__dirname, 'node_modules/@chainsafe/bls-keystore/lib/cipher'),
      '@chainsafe/bls-keystore/lib/kdf.js': path.resolve(__dirname, 'node_modules/@chainsafe/bls-keystore/lib/kdf')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new CopyWebpackPlugin({
      patterns: ["index.html", "favicon.ico", "favicon.png", "manifest.json"],
    }),
  ],
};
