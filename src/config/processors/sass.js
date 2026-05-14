const { glob } = require("glob");
const fs = require("fs");
const path = require("path");

const sass = require("sass");
const postcss = require("postcss");

const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const isProduction = process.env.ELEVENTY_ENV === "PROD";

const processor = postcss([autoprefixer(), ...(isProduction ? [cssnano({ preset: "default" })] : [])]);

module.exports = async function () {
    fs.mkdirSync("./public/assets/css", { recursive: true });

    const filenames = await glob("src/assets/sass/**/*.scss");

    const sassFiles = filenames
        .filter((file) => !path.basename(file).startsWith("_"))
        .map((file) => ({ path: file }));

    const processPromises = sassFiles.map(async (file) => {
        try {
            const filename = path.basename(file.path, path.extname(file.path));
            const cssPath = `./public/assets/css/${filename}.css`;
            const mapPath = `./public/assets/css/${filename}.css.map`;

            const sassResult = sass.compile(file.path, {
                sourceMap: !isProduction,
                sourceMapIncludeSources: !isProduction,
                style: "expanded",
                loadPaths: ["src/assets/sass"],
            });

            const postcssResult = await processor.process(sassResult.css, {
                from: file.path,
                to: cssPath,
                map: isProduction
                    ? false
                    : {
                          prev: sassResult.sourceMap ? JSON.stringify(sassResult.sourceMap) : undefined,
                          inline: false,
                          annotation: true,
                      },
            });

            fs.writeFileSync(cssPath, postcssResult.css);

            if (postcssResult.map && !isProduction) {
                fs.writeFileSync(mapPath, postcssResult.map.toString());
            }
        } catch (error) {
            console.error(`Error processing ${file.path}:`, error);
        }
    });

    await Promise.all(processPromises);
};
