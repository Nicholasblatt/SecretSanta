const encode = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const decode = (text) =>
  Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
    c.charCodeAt(0),
  );

export async function createGiftLink(giver, recipient, language, baseUrl) {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(
    JSON.stringify({ giver, recipient }),
  );
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload),
  );
  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  const url = new URL(baseUrl);
  url.search = "";
  url.searchParams.set("lang", language);
  url.hash = `gift=v1.${encode(rawKey)}.${encode(iv)}.${encode(ciphertext)}`;
  return url.href;
}

export async function readGiftLink(href) {
  const url = new URL(href);
  const gift = new URLSearchParams(url.hash.slice(1)).get("gift");
  if (gift) {
    const [version, keyText, ivText, cipherText, extra] = gift.split(".");
    if (version !== "v1" || !keyText || !ivText || !cipherText || extra)
      throw new Error("Invalid link");
    const key = await crypto.subtle.importKey(
      "raw",
      decode(keyText),
      "AES-GCM",
      false,
      ["decrypt"],
    );
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: decode(ivText) },
      key,
      decode(cipherText),
    );
    const data = JSON.parse(new TextDecoder().decode(plaintext));
    if (
      typeof data.recipient !== "string" ||
      !data.recipient.trim() ||
      typeof data.giver !== "string"
    )
      throw new Error("Invalid gift");
    return data;
  }
  if (url.searchParams.has("name")) {
    const value = url.searchParams.get("name");
    let recipient;
    if (value?.startsWith("U2FsdGVkX1")) {
      await loadLegacyCrypto();
      recipient = window.CryptoJS.AES.decrypt(
        value,
        "your-secret-key",
      ).toString(window.CryptoJS.enc.Utf8);
    } else {
      const key = "myKey";
      recipient = Array.from(value || "", (char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^ key.charCodeAt(i % key.length),
        ),
      ).join("");
    }
    if (!recipient?.trim() || /[\x00-\x1f]/.test(recipient))
      throw new Error("Invalid legacy link");
    return { recipient, giver: "" };
  }
  return null;
}

function loadLegacyCrypto() {
  if (window.CryptoJS) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./vendor/crypto-js.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}
