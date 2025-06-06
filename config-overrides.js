const {addDecoratorsLegacy, override, fixBabelImports, addWebpackAlias} = require('customize-cra');
const addLessLoader = require('customize-cra-less-loader');
const path = require('path');
module.exports = override(
    addDecoratorsLegacy(),
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        lessLoaderOptions: {
            lessOptions: {
                javascriptEnabled: true,
                modifyVars: {
                    '@primary-color': '#038fde',
                }
            }
        }
    }),
    addWebpackAlias({
        '@@': path.resolve(__dirname, 'src/components'),
        "@": path.resolve(__dirname, 'src'),
    }),
);