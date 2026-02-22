// Simple password authentication

const password = 'yourPassword';

function authenticate(inputPassword) {
    if (inputPassword === password) {
        console.log('Access granted');
    } else {
        console.log('Access denied');
    }
}

// Example usage
// authenticate('userProvidedPassword');
