const fs = require('fs');
const https = require('https');
const path = require('path');

const apis = {
    'naruto.mp3': 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=Naruto+mission+complete',
    'onepiece.mp3': 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=One+Piece+mission+complete',
    'frieren.mp3': 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=Elven+magic+ready'
};

const dl = (name, url) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            dl(name, res.headers.location);
        } else {
            const dest = path.join(__dirname, 'public', 'sounds', name);
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${name} successfully! Size: ${fs.statSync(dest).size} bytes`);
            });
        }
    }).on('error', (err) => console.error(`Error downloading ${name}:`, err.message));
};

Object.keys(apis).forEach(k => dl(k, apis[k]));
