const https = require('https');

const data = JSON.stringify({
    email: 'admin@example.com'
});

const options = {
    hostname: 'onlinesaathi-sso.vercel.app',
    port: 443,
    path: '/api/auth/check-email',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing: ' + options.hostname + options.path);

const req = https.request(options, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    console.log('Headers:');
    console.log(JSON.stringify(res.headers, null, 2));

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
