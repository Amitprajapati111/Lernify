const mongoose = require('mongoose');
require('dotenv').config();
const LiveClass = require('./models/LiveClass');
const fs = require('fs');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const cls = await LiveClass.findOne({ roomId: '4b45174f-6134-4e40-9c7e-930167266a71' });
        const all = await LiveClass.find({}, 'roomId topic');

        const output = `Class found: ${cls ? "YES" : "NO"}\nTotal DB Classes: ${all.length}\n${JSON.stringify(all, null, 2)}`;
        fs.writeFileSync('db-result.txt', output);

        process.exit(0);
    } catch (e) {
        fs.writeFileSync('db-result.txt', e.stack);
        process.exit(1);
    }
})();
