import { test } from "node:test";
import assert from "node:assert/strict";
import { drawNames, parseRules, validatePeople, normalize } from "../draw.js";
import { createGiftLink, readGiftLink } from "../parseQueryParams.js";
import { translations } from "../translations.js";
const group = (names) =>
  names.map((name) => ({ name, preferences: "", aversions: "" }));
const valid = (people, matches) => {
  assert.equal(matches.length, people.length);
  assert.equal(new Set(matches.map((m) => m.recipient)).size, people.length);
  for (const match of matches) {
    assert.notEqual(match.giver, match.recipient);
    const giver = people.find((p) => p.name === match.giver);
    assert.ok(
      !parseRules(giver.aversions, people).includes(normalize(match.recipient)),
    );
  }
};
test("each person gives and receives once, with no self draws across repeated draws", () => {
  for (const count of [3, 4, 8, 20, 100]) {
    const people = group(
      Array.from({ length: count }, (_, i) => `Person ${i}`),
    );
    for (let i = 0; i < 20; i++) valid(people, drawNames(people).matches);
  }
});
test("exclusions always hold, including when preferences compete", () => {
  const people = group(["Ana", "João", "Maria", "Nick"]);
  people[0].aversions = "João, Maria";
  people[1].preferences = "Nick";
  for (let i = 0; i < 50; i++) {
    const { matches } = drawNames(people);
    valid(people, matches);
    assert.equal(matches[0].recipient, "Nick");
  }
});
test("fulfills all compatible preferences and resolves competing ones", () => {
  const people = group(["Ana", "João", "Maria"]);
  people[0].preferences = "João";
  people[1].preferences = "Maria";
  people[2].preferences = "Ana";
  for (let i = 0; i < 20; i++)
    assert.deepEqual(
      drawNames(people).matches.map((m) => m.recipient),
      ["João", "Maria", "Ana"],
    );
});
test("impossible exclusions terminate with an actionable error", () => {
  const people = group(["Ana", "João", "Maria", "Nick"]);
  for (const p of people)
    p.aversions = ["João", "Maria", "Nick"]
      .filter((n) => n !== p.name)
      .join(",");
  assert.equal(drawNames(people).error.code, "impossible");
});
test("validates too-small groups, duplicate names, unknown names, conflicts, and self rules", () => {
  assert.equal(drawNames(group(["A", "B"])).error.code, "minimum");
  assert.equal(validatePeople(group(["Ana", " ana ", "B"])).code, "duplicate");
  const people = group(["Ana", "João", "Maria"]);
  people[0].preferences = "John";
  assert.equal(validatePeople(people).code, "unknown");
  people[0].preferences = "ANA";
  assert.equal(validatePeople(people).code, "selfRule");
  people[0].preferences = "João";
  people[0].aversions = "JOÃO";
  assert.equal(validatePeople(people).code, "conflict");
});
test("supports full names, composed accents, old space-separated names, and comma lists", () => {
  const people = group(["Ana Silva", "João", "Maria"]);
  assert.deepEqual(parseRules("Ana Silva, Joa\u0303o", people), [
    "ana silva",
    "joão",
  ]);
  assert.deepEqual(parseRules("João Maria", people), ["joão", "maria"]);
});
test("draws vary across runs", () => {
  const people = group(["A", "B", "C", "D", "E"]);
  const runs = new Set(
    Array.from({ length: 20 }, () => JSON.stringify(drawNames(people).matches)),
  );
  assert.ok(runs.size > 1);
});
test("encrypted reveal links round-trip Portuguese names and HTML-like text safely", async () => {
  const giver = "João & família",
    recipient = "<script>Maria 💚</script>";
  const link = await createGiftLink(
    giver,
    recipient,
    "pt",
    "https://ssproj-770af.web.app/?old=1",
  );
  assert.ok(!link.includes("Maria"));
  assert.ok(!link.includes("old="));
  assert.equal(new URL(link).searchParams.get("lang"), "pt");
  assert.deepEqual(await readGiftLink(link), { giver, recipient });
  const second = await createGiftLink(giver, recipient, "pt", link);
  assert.notEqual(link, second);
});
test("rejects broken reveal links and handles a normal page", async () => {
  await assert.rejects(
    readGiftLink("https://example.com/#gift=v1.bad.bad.bad"),
  );
  assert.equal(await readGiftLink("https://example.com/"), null);
});
test("preserves original XOR links", async () => {
  const name = "JOÃO",
    key = "myKey";
  const encrypted = Array.from(name, (c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
  ).join("");
  assert.equal(
    (
      await readGiftLink(
        `https://example.com/?name=${encodeURIComponent(encrypted)}`,
      )
    ).recipient,
    name,
  );
});
test("English and Portuguese have matching translation keys", () => {
  assert.deepEqual(
    Object.keys(translations.en).sort(),
    Object.keys(translations.pt).sort(),
  );
});
test("preserves deployed AES links and rejects empty legacy links", async () => {
  const { default: CryptoJS } = await import("crypto-js");
  globalThis.window = { CryptoJS };
  try {
    const old = CryptoJS.AES.encrypt("MARIA", "your-secret-key").toString();
    assert.equal(
      (
        await readGiftLink(
          `https://example.com/?name=${encodeURIComponent(old)}`,
        )
      ).recipient,
      "MARIA",
    );
    await assert.rejects(readGiftLink("https://example.com/?name="));
  } finally {
    delete globalThis.window;
  }
});
test("constrained draws maximize possible preferences, checked against every small permutation", () => {
  const permutations = (list) =>
    list.length
      ? list.flatMap((value, i) =>
          permutations(list.filter((_, j) => i !== j)).map((rest) => [
            value,
            ...rest,
          ]),
        )
      : [[]];
  const possible = permutations([0, 1, 2, 3, 4]);
  for (let seed = 0; seed < 20; seed++) {
    const people = group(["A", "B", "C", "D", "E"]);
    for (let i = 0; i < 5; i++) {
      people[i].preferences = people[(i + 1) % 5].name;
      people[i].aversions = people
        .filter(
          (p, j) =>
            j !== i && j !== (i + 1) % 5 && (j * 3 + i + seed) % 4 === 0,
        )
        .map((p) => p.name)
        .join(",");
    }
    const feasible = possible.filter((order) =>
      order.every(
        (j, i) =>
          j !== i &&
          !parseRules(people[i].aversions, people).includes(
            normalize(people[j].name),
          ),
      ),
    );
    const optimum = Math.max(
      ...feasible.map(
        (order) =>
          order.filter((j, i) => people[i].preferences === people[j].name)
            .length,
      ),
    );
    const result = drawNames(people);
    if (!feasible.length) assert.equal(result.error.code, "impossible");
    else {
      valid(people, result.matches);
      assert.equal(
        result.matches.filter((m, i) => m.recipient === people[i].preferences)
          .length,
        optimum,
      );
    }
  }
});
