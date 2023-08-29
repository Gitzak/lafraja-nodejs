const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const moviesFilePath = path.join(__dirname, '../db', 'movies.json');

// Serve static files
function serveStaticFile(filePath, res) {
    const contentType = mime.getType(filePath) || 'text/plain';
    res.setHeader('Content-Type', contentType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    });
}

// Search Movies
function searchMovies(searchTerm, movies, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(startIndex, endIndex);
}

// search pagination
function generateSearchPagination(searchTerm, currentPage, totalPages) {
    let buttonsHtml = '';

    const paginationBaseLink = `/search?q=${searchTerm}`;

    if (currentPage > 1) {
        buttonsHtml += `<a href="${paginationBaseLink}&page=${currentPage - 1}" class="btn btn-dark btn-lg px-4">Previous</a>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            buttonsHtml += `<span class="btn btn-dark btn-lg px-4 active">${i}</span>`;
        } else {
            buttonsHtml += `<a href="${paginationBaseLink}&page=${i}" class="btn btn-dark btn-lg px-4">${i}</a>`;
        }
    }

    if (currentPage < totalPages) {
        buttonsHtml += `<a href="${paginationBaseLink}&page=${currentPage + 1}" class="btn btn-dark btn-lg px-4">Next</a>`;
    }

    return buttonsHtml;
}

// Generate search results
function generateSearchResults(searchResults) {
    return searchResults.map(movie => `
    <div class="col mb-5">
        <div class="card h-100 bg-dark text-white shadow">
            <a class"text-decoration-none" href="/details-movie?id=${movie.id}">
                <img class="card-img-top img-fluid" src="${movie.imageSrc}" alt="..." />
            </a>
            <div class="card-body p-4">
                <div class="text-left">
                    <h5 class="fw-bolder"><a class"text-decoration-none" href="/details-movie?id=${movie.id}" style="
                    color: #ffffff;
                    text-decoration: none;
                ">${movie.title}</a></h5>
                </div>
            </div>
            <div class="card-footer border-top-0 bg-transparent">
                <div class="d-flex justify-content-center">
                    ${movie.quality ? `<span class="m-1 badge bg-secondary text-white">${movie.quality}</span>` : ''}
                    ${movie.imdbRating ? `<span class="m-1 badge bg-warning text-dark">${movie.imdbRating}</span>` : ''}
                    ${movie.duration ? `<span class="m-1 badge bg-info text-dark">${movie.duration}</span>` : ''}
                </div>
            </div>
        </div>
    </div>
    `).join('');
}

// generate movies content
function generateMovieCards(movies) {
    return movies.map(movie => `
        <div class="col mb-5">
            <div class="card h-100 bg-dark text-white shadow">
                <a class"text-decoration-none" href="/details-movie?id=${movie.id}">
                    <img class="card-img-top img-fluid" src="${movie.imageSrc}" alt="..." />
                </a>
                <div class="card-body p-4">
                    <div class="text-left">
                        <h5 class="fw-bolder"><a class"text-decoration-none" href="/details-movie?id=${movie.id}" style="
                        color: #ffffff;
                        text-decoration: none;
                    ">${movie.title}</a></h5>
                    </div>
                </div>
                <div class="card-footer border-top-0 bg-transparent">
                    <div class="d-flex justify-content-center">
                        ${movie.quality ? `<span class="m-1 badge bg-secondary text-white">${movie.quality}</span>` : ''}
                        ${movie.imdbRating ? `<span class="m-1 badge bg-warning text-dark">${movie.imdbRating}</span>` : ''}
                        ${movie.duration ? `<span class="m-1 badge bg-info text-dark">${movie.duration}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// generate single movie
function generateMovieDetails(movie) {
    return `
        <div class="col-md-6 text-center">
            ${movie.imageSrc ? `<img width="320" class="mb-5 mb-md-0 img-fluid" src="${movie.imageSrc}" alt="Movie Image" />` : ''}
        </div>
        <div class="col-md-6">
            <h1 class="display-5 fw-bolder text-white">${movie.title}</h1>
            <div class="fs-5 my-3">
                ${movie.quality ? `<span class="m-1 badge bg-secondary text-white">${movie.quality}</span>` : ''}
                ${movie.imdbRating ? `<span class="m-1 badge bg-warning text-dark">${movie.imdbRating}</span>` : ''}
                ${movie.duration ? `<span class="m-1 badge bg-info text-dark">${movie.duration}</span>` : ''}
            </div>
            ${movie.overview ? `
                <h4 class="text-white">Overview:</h4>
                <p class="lead text-white">${movie.overview}</p>` : ''}
            ${movie.genres && movie.genres.length > 0 ? `
                <div class="fs-5 my-3">
                    <span class="m-1 text-white">Genres : ${movie.genres.join(' | ')}</span>
                </div>` : ''}
            ${movie.casts && movie.casts.length > 0 ? `
                <div class="fs-5 my-3">
                    <span class="m-1 text-white">Casts : ${movie.casts.join(', ')}</span>
                </div>` : ''}
        </div>
        ${movie.trailer ? `
        <div class="col-12 mt-5">
            <div class="video-container">
                <iframe class="embed-responsive-item" src="${movie.trailer}" allowfullscreen></iframe>
            </div>
        </div>` : ''}
    `;
}

// similar Movies
function generateSimilarMovies(similarMovies) {
    return similarMovies.map(movie => `
        <div class="col mb-5">
            <div class="card h-100 bg-dark text-white shadow">
                <a class"text-decoration-none" href="/details-movie?id=${movie.id}">
                    <img class="card-img-top img-fluid" src="${movie.imageSrc}" alt="..." />
                </a>
                <div class="card-body p-4">
                    <div class="text-left">
                        <h5 class="fw-bolder"><a class"text-decoration-none" href="/details-movie?id=${movie.id}" style="
                        color: #ffffff;
                        text-decoration: none;
                    ">${movie.title}</a></h5>
                    </div>
                </div>
                <div class="card-footer border-top-0 bg-transparent">
                    <div class="d-flex justify-content-center">
                        ${movie.quality ? `<span class="m-1 badge bg-secondary text-white">${movie.quality}</span>` : ''}
                        ${movie.imdbRating ? `<span class="m-1 badge bg-warning text-dark">${movie.imdbRating}</span>` : ''}
                        ${movie.duration ? `<span class="m-1 badge bg-info text-dark">${movie.duration}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// find similar movies
function findSimilarMoviesByGenres(movie, allMovies) {
    const similarMovies = allMovies.filter(otherMovie =>
        otherMovie.id !== movie.id &&
        otherMovie.genres.some(genre => movie.genres.includes(genre))
    );
    return similarMovies.slice(0, 4);
}

// generate pagination
function generatePaginationButtons(currentPage, totalPages, page_name, searchTerm = '') {
    console.log(totalPages);
    let buttonsHtml = '';

    const paginationBaseLink = searchTerm ? `/${page_name}?q=${searchTerm}` : `/${page_name}`;

    if (currentPage > 1) {
        buttonsHtml += `<a href="${paginationBaseLink}?page=${currentPage - 1}" class="btn btn-dark btn-lg px-4">Previous</a>`;
    }

    if (currentPage > 3) {
        buttonsHtml += `<a href="${paginationBaseLink}?page=1" class="btn btn-dark btn-lg px-4">1</a>`;
        if (currentPage > 4) {
            buttonsHtml += `<span class="btn btn-dark btn-lg px-4 disabled">...</span>`;
        }
    }

    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            buttonsHtml += `<span class="btn btn-dark btn-lg px-4 active">${i}</span>`;
        } else {
            buttonsHtml += `<a href="${paginationBaseLink}?page=${i}" class="btn btn-dark btn-lg px-4">${i}</a>`;
        }
    }

    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) {
            buttonsHtml += `<span class="btn btn-dark btn-lg px-4 disabled">...</span>`;
        }
        buttonsHtml += `<a href="${paginationBaseLink}?page=${totalPages}" class="btn btn-dark btn-lg px-4">${totalPages}</a>`;
    }

    if (currentPage < totalPages) {
        buttonsHtml += `<a href="${paginationBaseLink}?page=${currentPage + 1}" class="btn btn-dark btn-lg px-4">Next</a>`;
    }

    return buttonsHtml;
}

// Route handlers implementation
function handleIndex(req, res, parsedUrl) {
    const movies = require(moviesFilePath);

    const page = Number(parsedUrl.searchParams.get('page')) || 1;
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMovies = movies.slice(startIndex, endIndex);

    const movieCards = generateMovieCards(paginatedMovies);
    const totalPages = Math.ceil(movies.length / itemsPerPage);
    const paginationButtons = generatePaginationButtons(page, totalPages, 'home');

    const templateFilePath = path.join(__dirname, '../public', 'index.html');

    fs.readFile(templateFilePath, 'utf-8', (err, template) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            const modifiedTemplate = template
                .replace('<!-- MovieCards -->', movieCards)
                .replace('<!-- PaginationButtons -->', paginationButtons);

            res.setHeader('Content-Type', 'text/html');
            res.end(modifiedTemplate);
        }
    });
}

function handleMovies(req, res, parsedUrl) {
    const movies = require(moviesFilePath);

    const page = Number(parsedUrl.searchParams.get('page')) || 1;
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMovies = movies.slice(startIndex, endIndex);

    const movieCards = generateMovieCards(paginatedMovies);
    const totalPages = Math.ceil(movies.length / itemsPerPage);
    const paginationButtons = generatePaginationButtons(page, totalPages, 'movies.html');

    const templateFilePath = path.join(__dirname, '../public', 'movies.html');

    fs.readFile(templateFilePath, 'utf-8', (err, template) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            const modifiedTemplate = template
                .replace('<!-- MovieCards -->', movieCards)
                .replace('<!-- PaginationButtons -->', paginationButtons);

            res.setHeader('Content-Type', 'text/html');
            res.end(modifiedTemplate);
        }
    });
}

function handleLogin(req, res) {
    const templateFilePath = path.join(__dirname, '../public', 'login.html');

    fs.readFile(templateFilePath, 'utf-8', (err, template) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.end(template);
        }
    });
}

function handleComingSoon(req, res) {
    const templateFilePath = path.join(__dirname, '../public', 'comingsoon.html');

    fs.readFile(templateFilePath, 'utf-8', (err, template) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.end(template);
        }
    });
}

function handleRegister(req, res) {
    const templateFilePath = path.join(__dirname, '../public', 'register.html');

    fs.readFile(templateFilePath, 'utf-8', (err, template) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.end(template);
        }
    });
}

function handleMovieDetails(req, res, parsedUrl) {
    const movieId = parsedUrl.searchParams.get('id');

    if (!movieId) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
        return;
    }

    const movies = require(moviesFilePath);

    const movie = movies.find(movie => movie.id === movieId);

    if (!movie) {
        const templateFilePath = path.join(__dirname, '../public', '404.html');
        fs.readFile(templateFilePath, 'utf-8', (err, template) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(template);
            }
        });
        return;
    }

    const similarMovies = findSimilarMoviesByGenres(movie, movies);

    // Exclude the current movie from similar movies
    const similarMoviesWithoutCurrent = similarMovies.filter(similarMovie => similarMovie.id !== movieId);

    const similarMoviesHtml = generateSimilarMovies(similarMoviesWithoutCurrent);

    const detailsTemplateFilePath = path.join(__dirname, '../public', 'details-movie.html');

    fs.readFile(detailsTemplateFilePath, 'utf-8', (err, template) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            const movieDetailsHtml = generateMovieDetails(movie);
            const modifiedTemplate = template
                .replace('<!-- movieDetails -->', movieDetailsHtml)
                .replace('<!-- alsoLike -->', similarMoviesHtml);

            res.setHeader('Content-Type', 'text/html');
            res.end(modifiedTemplate);
        }
    });
}

function handleSearch(req, res, parsedUrl) {
    const queryObject = parsedUrl.searchParams;
    const searchTerm = queryObject.get('q') || '';
    const page = Number(queryObject.get('page')) || 1;
    const itemsPerPage = 20;

    const movies = require(moviesFilePath);

    const searchResults = searchMovies(searchTerm, movies, page, itemsPerPage);
    const searchResultsHtml = generateSearchResults(searchResults);

    const totalPages = Math.ceil(searchResults.length / itemsPerPage);
    const searchPagination = generateSearchPagination(searchTerm, page, totalPages);

    const searchFilePath = path.join(__dirname, '../public', 'search.html');
    fs.readFile(searchFilePath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            const modifiedHtml = data
                .replace('<!-- SearchResult-->', searchResultsHtml)
                .replace('<!-- SearchPagination -->', searchPagination);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(modifiedHtml);
        }
    });
}

function handleAssets(req, res) {
    const filePath = path.join(__dirname, '../public', req.url);
    serveStaticFile(filePath, res);
}

function handle404(req, res, parsedUrl) {
    const templateFilePath = path.join(__dirname, '../public', '404.html');
    fs.readFile(templateFilePath, 'utf-8', (err, template) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(template);
        }
    });
}

// Create server
const server = http.createServer((req, res) => {
    const url = req.url;
    const parsedUrl = new URL(url, `http://${req.headers.host}`);

    console.log(parsedUrl.pathname);

    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/home') {
        handleIndex(req, res, parsedUrl);
    } else if (parsedUrl.pathname === '/movies') {
        handleMovies(req, res, parsedUrl);
    } else if (parsedUrl.pathname === '/details-movie') {
        handleMovieDetails(req, res, parsedUrl);
    } else if (parsedUrl.pathname === '/search' && req.method === 'GET') {
        handleSearch(req, res, parsedUrl);
    } else if (url.startsWith('/assets/')) {
        handleAssets(req, res);
    } else if (parsedUrl.pathname === '/login') {
        handleLogin(req, res);
    } else if (parsedUrl.pathname === '/series') {
        handleComingSoon(req, res);
    } else if (parsedUrl.pathname === '/topimdb') {
        handleComingSoon(req, res);
    } else if (parsedUrl.pathname === '/tvShows') {
        handleComingSoon(req, res);
    } else if (parsedUrl.pathname === '/register') {
        handleRegister(req, res);
    } else {
        handle404(req, res);
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});