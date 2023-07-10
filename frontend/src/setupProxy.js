const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://127.0.0.1:8000",
            changeOrigin: true,
        }),
    );
    app.use(
        "/docs",
        createProxyMiddleware({
            target: "http://127.0.0.1:8000",
            changeOrigin: true,
        }),
    );
    app.use(
        "/openapi.json",
        createProxyMiddleware({
            target: "http://127.0.0.1:8000",
            changeOrigin: true,
        }),
    );
};
