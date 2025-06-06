const {createProxyMiddleware} = require("http-proxy-middleware/dist/factory");
module.exports = function (app) {
    app.use(
        "/api/",
        createProxyMiddleware({
            target: "http://192.168.1.184:8080/api/",
            changeOrigin: true
        }),
    );
};