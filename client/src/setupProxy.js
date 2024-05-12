const { createProxyMiddleware } = require('http-proxy-middleware');
const env = process.env.REACT_APP_ENV || 'development';
const config = require('./config/config.json')[env];

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: config.baseURL,
            changeOrigin: true,
        })
    );
    app.use(
        '/*.png',
        createProxyMiddleware({
            target: config.baseURL,
            changeOrigin: true,
        })
    );
    app.use(
        '/*.jpg',
        createProxyMiddleware({
            target: config.baseURL,
            changeOrigin: true,
        })
    );
    app.use(
        '/*.jpeg',
        createProxyMiddleware({
            target: config.baseURL,
            changeOrigin: true,
        })
    );
    
    app.use(
        '/*.MP4',
        createProxyMiddleware({
            target: config.baseURL,
            changeOrigin: true,
        })
    );
   
};