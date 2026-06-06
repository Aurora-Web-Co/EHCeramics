const { glob } = require("glob");
const path = require("path");

module.exports = async function () {
  const imagesDir = path.join(__dirname, "..", "assets", "images").replace(/\\/g, "/");
  const files = await glob(`${imagesDir}/*.{jpg,jpeg,png,webp,avif,gif}`);
  return files
    .sort()
    .map((f) => "/assets/images/" + path.basename(f))
    .filter((f) => f !== "/assets/images/Intro-image.jpg");
};
