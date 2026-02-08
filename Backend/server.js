require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', `  🚀 Server is listening on port ${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------');
    console.log('\x1b[33m%s\x1b[0m', `  Local: http://localhost:${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------');
});
