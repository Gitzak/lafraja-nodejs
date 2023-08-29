const http = require('http');

const helpers = require('./helpers')

// Create server
const server = http.createServer((req, res) => {
    const url = req.url;
    const parsedUrl = new URL(url, `http://${req.headers.host}`);

    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/home') {
        helpers.handleIndex(req, res, parsedUrl);
    } else if (parsedUrl.pathname === '/movies') {
        helpers.handleMovies(req, res, parsedUrl);
    } else if (parsedUrl.pathname === '/details-movie') {
        helpers.handleMovieDetails(req, res, parsedUrl);
    } else if (parsedUrl.pathname === '/search' && req.method === 'GET') {
        helpers.handleSearch(req, res, parsedUrl);
    } else if (url.startsWith('/assets/')) {
        helpers.handleAssets(req, res);
    } else if (parsedUrl.pathname === '/login') {
        helpers.handleLogin(req, res);
    } else if (parsedUrl.pathname === '/series') {
        helpers.handleComingSoon(req, res);
    } else if (parsedUrl.pathname === '/topimdb') {
        helpers.handleComingSoon(req, res);
    } else if (parsedUrl.pathname === '/tvShows') {
        helpers.handleComingSoon(req, res);
    } else if (parsedUrl.pathname === '/register') {
        helpers.handleRegister(req, res);
    } else {
        helpers.handle404(req, res);
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});