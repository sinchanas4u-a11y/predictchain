const bcrypt = require('bcryptjs');

async function test() {
    try {
        console.log('Starting test...');
        const salt = await bcrypt.genSalt(10);
        console.log('Salt:', salt);
        const hashed = await bcrypt.hash('testpassword', salt);
        console.log('Hashed:', hashed);
        const match = await bcrypt.compare('testpassword', hashed);
        console.log('Match:', match);
        process.exit(0);
    } catch (err) {
        console.error('Bcrypt Test Failed:', err);
        process.exit(1);
    }
}

test();
