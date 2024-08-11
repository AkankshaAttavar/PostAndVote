module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Example: Exclude WalletConnect and Worldcoin packages from source maps
            webpackConfig.module.rules.push({
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
                exclude: [
                    /node_modules\/@walletconnect/,
                    /node_modules\/@worldcoin/,
                ],
            });

            return webpackConfig;
        },
    },
};
