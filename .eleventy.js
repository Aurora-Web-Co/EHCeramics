const pluginImages = require("@codestitchofficial/eleventy-plugin-sharp-images");
const pluginMinifier = require("@codestitchofficial/eleventy-plugin-minify");
const pluginSitemap = require("@quasibit/eleventy-plugin-sitemap");

const configSitemap = require("./src/config/plugins/sitemap");
const configImages = require("./src/config/plugins/images");

const sass = require("./src/config/processors/sass");
const javascript = require("./src/config/processors/javascript");

const filterPostDate = require("./src/config/filters/postDate");
const filterIsoDate = require("./src/config/filters/isoDate");

const isProduction = process.env.ELEVENTY_ENV === "PROD";

module.exports = function (eleventyConfig) {
    eleventyConfig.setServerOptions({ host: "0.0.0.0" });

    eleventyConfig.on("eleventy.after", javascript);
    eleventyConfig.on("eleventy.after", sass);

    eleventyConfig.addPlugin(pluginImages, configImages);
    eleventyConfig.addPlugin(pluginSitemap, configSitemap);

    if (isProduction) {
        eleventyConfig.addPlugin(pluginMinifier);
    }

    eleventyConfig.addPassthroughCopy("./src/assets");
    eleventyConfig.addPassthroughCopy("./src/_redirects");

    eleventyConfig.addFilter("postDate", filterPostDate);
    eleventyConfig.addFilter("isoDate", filterIsoDate);

    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

    return {
        dir: {
            input: "src",
            output: "public",
            includes: "_includes",
            data: "_data",
        },
        htmlTemplateEngine: "njk",
    };
};
