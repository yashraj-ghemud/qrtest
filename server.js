// Custom server.js for Render deployment with proper PORT binding
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // CRITICAL: Must be 0.0.0.0 for Render
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🚀 Starting Next.js server...`);
console.log(`📍 Hostname: ${hostname}`);
console.log(`🔌 Port: ${port}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('❌ Error handling request:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    }).listen(port, hostname, (err) => {
        if (err) throw err;
        console.log(`✅ Server ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
    console.error('❌ Failed to prepare Next.js app:', err);
    process.exit(1);
});
