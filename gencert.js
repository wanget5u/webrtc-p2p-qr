import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const selfsigned = require('selfsigned');

const attrs = [{ name: 'commonName', value: 'localhost' }];

async function generate() {
    console.log("Generating certificates...");

    const pems = await selfsigned.generate(attrs, { days: 365 });

    fs.writeFileSync('key.pem', pems.private);
    fs.writeFileSync('cert.pem', pems.cert);
    console.log("'key.pem' and 'cert.pem' have been created.");
}

generate().catch(err => console.error("Failed:", err));