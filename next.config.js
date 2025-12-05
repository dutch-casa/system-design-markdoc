const withMarkdoc = require("@markdoc/next.js");
const path = require("path");

module.exports =
  withMarkdoc(/* config: https://markdoc.io/docs/nextjs#options */)({
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdoc"],
    turbopack: {
      resolveAlias: {
        "@": path.resolve(__dirname),
      },
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname),
      };
      return config;
    },
  });
