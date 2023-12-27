var gulp = require("gulp");
const download = require("gulp-download");
const { createReadStream } = require('fs');
const { rm, mkdir } = require('shelljs');
const unzipper = require('unzipper');
const puppeteerPath = './wwwroot/scripts/puppeteer/Win-901912';

gulp.task('Puppeteer-download', (done) => {
    mkdir('-p', `${puppeteerPath}`);
    download('https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/901912/chrome-win.zip')
        .pipe(gulp.dest(`${puppeteerPath}`))
        .on('end', () => {
            createReadStream(`${puppeteerPath}/chrome-win.zip`)
            .pipe(unzipper.Extract({ path: `${puppeteerPath}` }))
            .on('close', () => {
                rm('-rf', [`${puppeteerPath}/chrome-win.zip`]);
                done();
            });
        })
});