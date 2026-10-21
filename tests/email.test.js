import { test } from "node:test";
import assert from "node:assert/strict";
import { createEmailLink, isValidEmail } from "../email.js";

const link = "https://ssproj-770af.web.app/?lang=pt#gift=v1.key.iv.cipher";

test("mailto prefills one recipient, subject, and complete encrypted link", () => {
  const mailto = createEmailLink({
    email: "ana+family@example.com",
    name: "Ana & João",
    link,
  });
  const url = new URL(mailto);
  assert.equal(url.protocol, "mailto:");
  assert.equal(decodeURIComponent(url.pathname), "ana+family@example.com");
  assert.equal(
    url.searchParams.get("subject"),
    "Your Secret Santa surprise 🎁",
  );
  const body = url.searchParams.get("body");
  assert.ok(body.startsWith("Hi Ana & João,\r\n\r\n"));
  assert.ok(body.includes(link));
  assert.equal(url.hash, "");
  assert.deepEqual([...url.searchParams.keys()], ["subject", "body"]);
});
test("Portuguese draft preserves accents and uses Portuguese copy", () => {
  const url = new URL(
    createEmailLink({
      email: "joao@example.com",
      name: "João",
      link,
      language: "pt",
    }),
  );
  assert.equal(
    url.searchParams.get("subject"),
    "Seu amigo secreto de Natal 🎁",
  );
  assert.ok(url.searchParams.get("body").startsWith("Olá, João!\r\n"));
  assert.ok(url.searchParams.get("body").includes(link));
});
test("an optional blank address opens a draft with an empty To field", () => {
  const url = new URL(createEmailLink({ name: "Ana", link }));
  assert.equal(url.pathname, "");
  assert.ok(url.searchParams.get("body").includes(link));
});
test("rejects multiple recipients and header injection in addresses", () => {
  for (const email of [
    "ana@example.com,bob@example.com",
    "ana@example.com;bob@example.com",
    "ana@example.com\r\nBcc:bob@example.com",
    "not-an-email",
  ]) {
    assert.equal(isValidEmail(email), false);
    assert.throws(
      () => createEmailLink({ email, name: "Ana", link }),
      /Invalid email/,
    );
  }
});
test("names and links cannot inject mailto fields or replace template placeholders", () => {
  const name = "Ana {link} &bcc=other@example.com";
  const url = new URL(
    createEmailLink({ email: "ana@example.com", name, link }),
  );
  assert.equal(url.searchParams.has("bcc"), false);
  assert.ok(url.searchParams.get("body").includes(name));
  assert.equal(url.searchParams.get("body").split(link).length - 1, 1);
});
