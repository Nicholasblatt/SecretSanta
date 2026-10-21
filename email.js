import { translations } from "./translations.js";

export function isValidEmail(email) {
  return email === "" || /^[^\s@,;<>]+@[^\s@,;<>]+$/.test(email);
}

// Each draft contains exactly one participant's link. Encode the full body so
// the gift URL's fragment and query parameters survive the mailto round trip.
export function createEmailLink({ email = "", name, link, language = "en" }) {
  if (!isValidEmail(email)) throw new Error("Invalid email address");
  const copy = translations[language] || translations.en;
  const body = copy.emailBody.replace(/\{(name|link)\}/g, (_, key) =>
    key === "name" ? name : link,
  );
  const address = email.split("@").map(encodeURIComponent).join("@");
  return `mailto:${address}?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, "\r\n"))}`;
}
