// Hardcoded key
const SECRET_KEY = "your-secret-key"; // Should be a long, random string

function encryptName(plaintext) {
    return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
}

function decryptName(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
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
