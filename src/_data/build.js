// Changes on every build. Appended to CSS/JS URLs (?v=...) so browsers and
// CDNs fetch fresh files after each deploy instead of serving cached copies.
module.exports = {
  version: Date.now().toString(36),
};
