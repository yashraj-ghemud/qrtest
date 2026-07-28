const fs = require('fs');
const path = require('path');

console.log('📦 Copying static files to standalone...');

// Copy static files
const staticPath = path.join(__dirname, '../.next/static');
const standalonePath = path.join(__dirname, '../.next/standalone/.next');
const publicPath = path.join(__dirname, '../public');
const standalonePublicPath = path.join(__dirname, '../.next/standalone/public');

try {
    // Create directories if they don't exist
    if (!fs.existsSync(standalonePath)) {
        fs.mkdirSync(standalonePath, { recursive: true });
    }

    // Copy static folder
    if (fs.existsSync(staticPath)) {
        fs.cpSync(staticPath, path.join(standalonePath, 'static'), { recursive: true });
        console.log('✅ Copied .next/static');
    }

    // Copy public folder
    if (fs.existsSync(publicPath)) {
        fs.cpSync(publicPath, standalonePublicPath, { recursive: true });
        console.log('✅ Copied public folder');
    }

    console.log('✅ Post-build complete!');
} catch (error) {
    console.error('❌ Post-build failed:', error.message);
    process.exit(1);
}
