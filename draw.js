export const normalize = (value) =>
  value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

// A comma preserves full names. Space-separated first names from the old site also work.
export function parseRules(value, people) {
  const names = new Set(people.map((person) => normalize(person.name)));
  return [
    ...new Set(
      value.split(/[,;\n]+/).flatMap((part) => {
        const name = normalize(part);
        if (!name) return [];
        if (names.has(name)) return [name];
        const words = name.split(" ");
        return words.length > 1 && words.every((word) => names.has(word))
          ? words
          : [name];
      }),
    ),
  ];
}

export function validatePeople(people) {
  if (people.length < 3) return { code: "minimum" };
  if (people.length > 100) return { code: "maximum" };
  const names = people.map((p) => normalize(p.name));
  if (names.some((name) => !name) || new Set(names).size !== names.length)
    return { code: "duplicate" };
  for (const person of people) {
    const preferences = parseRules(person.preferences, people);
    const aversions = parseRules(person.aversions, people);
    for (const name of [...preferences, ...aversions]) {
      if (!names.includes(name))
        return { code: "unknown", name: person.name, detail: name };
      if (name === normalize(person.name))
        return { code: "selfRule", name: person.name };
    }
    if (preferences.some((name) => aversions.includes(name)))
      return { code: "conflict", name: person.name };
  }
  return null;
}

function random() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

// Minimum-cost bipartite assignment (Hungarian algorithm), O(n³).
// Forbidden pairs cannot win; each extra preference outweighs all random tie-breaks.
// Unlike retry-based shuffling, this terminates even when rules are impossible.
export function drawNames(people) {
  const error = validatePeople(people);
  if (error) return { error };
  const n = people.length;
  const forbidden = 1e9;
  const costs = people.map((person) => {
    const preferred = parseRules(person.preferences, people);
    const excluded = parseRules(person.aversions, people);
    return people.map((recipient) => {
      const name = normalize(recipient.name);
      if (name === normalize(person.name) || excluded.includes(name))
        return forbidden;
      return (preferred.includes(name) ? 0 : n + 1) + random();
    });
  });
  const u = Array(n + 1).fill(0),
    v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0),
    way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity),
      used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity,
        j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = costs[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }
  const matches = Array(n);
  for (let j = 1; j <= n; j++) {
    if (costs[p[j] - 1][j - 1] >= forbidden)
      return { error: { code: "impossible" } };
    matches[p[j] - 1] = {
      giver: people[p[j] - 1].name,
      recipient: people[j - 1].name,
    };
  }
  return { matches };
}
