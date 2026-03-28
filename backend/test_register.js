// Native fetch in Node 18+

async function test() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'real_test_user',
                password: 'password123',
                role: 'user'
            })
        });
        const data = await response.json();
        console.log('Response:', data);
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

test();
