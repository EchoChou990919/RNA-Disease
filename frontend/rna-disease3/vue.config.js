module.exports = {
    chainWebpack: (config) => {
        config.module
            .rule("worker")
            .test(/\.worker\.js$/)
            .use("worker-loader")
            .loader("worker-loader")
            .options({
                inline: "fallback"
            });
        config.module.rule("js").exclude.add(/\.worker\.js$/);
    },
}