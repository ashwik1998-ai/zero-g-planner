const fs = require('fs');
const https = require('https');
const path = require('path');

const pixa = {
    'naruto.mp3': 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_f55bb95925.mp3',
    'onepiece.mp3': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_7314a51139.mp3',
    'frieren.mp3': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_517173b2dd.mp3',
    'default.mp3': 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3'
};

const dl = (name, url) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            dl(name, res.headers.location);
        } else {
            const dest = path.join(__dirname, 'public', 'sounds', name);
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${name}`);
            });
        }
    }).on('error', (err) => console.error(`Error downloading ${name}:`, err.message));
};

Object.keys(pixa).forEach(k => dl(k, pixa[k]));
