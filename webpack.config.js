module.exports = {
    entry: "./src/frontend/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    devtool: "source-map",

    resolve: {
        extensions: ['.tsx', '.ts', '.js', ".js", ".json"]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};
