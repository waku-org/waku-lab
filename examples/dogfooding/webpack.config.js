const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts", // Changed from index.js to index.ts
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js",
  },
  experiments: {
    asyncWebAssembly: true,
  },
  resolve: {
    extensions: ['.ts', '.js'], // Add .ts to the extensions
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Add a rule for TypeScript files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({
      patterns: ["index.html", "favicon.ico", "favicon.png", "manifest.json"],
    }),
    new webpack.DefinePlugin({
      'process.env.TELEMETRY_URL': JSON.stringify(process.env.TELEMETRY_URL || "https://telemetry.status.im/waku-metrics")
    }),
  ],
};
