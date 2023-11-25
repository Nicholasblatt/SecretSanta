const key = "myKey";

// Encryption function
function encryptName(plaintext) {
let ciphertext = [];
    for (let i = 0; i < plaintext.length; i++) {
        const block = plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        ciphertext.push(block);
    }
    return String.fromCharCode.apply(null, ciphertext);
}
// Decryption function
function decryptName(ciphertext) {
    let plaintext = [];
    for (let i = 0; i < ciphertext.length; i++) {
        const block = ciphertext.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        plaintext.push(block);
    }
    return String.fromCharCode.apply(null, plaintext);
}

// Assuming the URL is 'file:///Users/nick.blatt/Custom%20Projects/SecretSanta-main/index.html?name=%22nvwinvwenviewnw%22'

// Get the current URL
const currentUrl = window.location.href;

// Create a URL object (necessary for file URLs)
const url = new URL(currentUrl);

// Use URLSearchParams to parse the query parameters
const params = new URLSearchParams(url.search);

// Get the 'name' parameter
const encryptedName = params.get('name');

if (encryptedName) {
    const resultName = decryptName(encryptedName);
    document.body.innerHTML = `<header>
    <h1 class="header-logo">Secret Santa Generator</h1>
    </header>
    <div class="resultName">
    You are buying for: ` + resultName + `
    </div>`;
} else {
    const script = document.createElement('script');
    script.src = "SecretSanta.js";
    document.body.appendChild(script);
}
