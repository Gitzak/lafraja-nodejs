const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // const categories = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Costume', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'Game-Show', 'History', 'Horror', 'Kungfu', 'Music', 'Musical', 'Mystery', 'Mythological', 'News', 'Psychological', 'Reality-TV', 'Romance', 'Sci-Fi', 'Short', 'Sitcom', 'Sport', 'Talk-Show', 'Thriller', 'TV Show', 'War', 'Western'];

    // const categ_page_data = ['movie', 'tv-show', 'top-imdb']
    // const categories = ['Action', 'Action & Adventure', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Kids', 'Music', 'Mystery', 'News', 'Reality', 'Romance', 'Sci-Fi & Fantasy', 'Science Fiction', 'Soap', 'Talk', 'Thriller', 'TV Movie', 'War', 'War & Politics', 'Western'];

    await page.goto('https://sflix.to/movie/');

    const lastPageNumber = await page.evaluate(() => {
        const lastPageLink = document.querySelector('.pagination.pagination-lg a[title="Last"]');
        const lastPageHref = lastPageLink.getAttribute('href');
        const lastPageNumber = lastPageHref.match(/page=(\d+)/)[1];
        return parseInt(lastPageNumber);
    });

    // console.log('Last Page Number:', lastPageNumber);

    let movieLinks = [];

    for (let i = 0; i <= 20; i++) {
        await page.goto('https://sflix.to/movie?page=' + i);

        const movieLinksOnPage = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.film_list .film_list-wrap .flw-item .film-poster .film-poster-ahref'), (e) => e.href)
        );

        movieLinks = movieLinks.concat(movieLinksOnPage);
    }

    const movies = [];

    for (const pageData of movieLinks) {

        const id = pageData.replace('https://sflix.to/movie/', '');

        await page.goto(pageData);

        const movieData = await page.evaluate((id) => {
            const imageSrc = document.querySelector('.film-poster-img').getAttribute('src');
            const trailer = document.querySelector('#modaltrailer iframe').getAttribute('data-src');
            const title = document.querySelector('.heading-name a').textContent?.trim();
            const quality = document.querySelector('.quality strong').textContent?.trim();
            const imdbRating = document.querySelector('.imdb').textContent?.trim();
            const duration = document.querySelector('.duration').textContent?.trim();
            const rawOverview = document.querySelector('.description').textContent.trim();
            const cleanedOverview = rawOverview.replace(/^Overview:\s+/, '');
            const finalOverview = cleanedOverview.replace(/\n/g, ' ').trim();
            const casts = Array.from(document.querySelectorAll('.row-line a[title][href^="/cast/"]')).map(cast => cast.textContent?.trim());
            const genres = Array.from(document.querySelectorAll('.row-line a[title][href^="/genre/"]')).map(genre => genre.textContent?.trim());

            return {
                id,
                imageSrc,
                trailer,
                title,
                quality,
                imdbRating,
                duration,
                overview: finalOverview,
                casts,
                genres
            };
        }, id);

        console.log(movieData);

        movies.push(movieData);
    }

    fs.writeFile('movies_3.json', JSON.stringify(movies, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Movie data has been written to movies.json');
        }
    });

    await browser.close();
}

run();
