import * as fs from 'fs'

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { version } = require('../../package.json')


fs.readFile('./dist/sedit.js', 'utf8', (err, data) => {
    if (err) { console.error(err); return; }
    fs.writeFile('./dist/sedit.js', `/*version: ${version}*/\n${data}` , err => {
        if (err) { console.error(err);  return; }
    });
})