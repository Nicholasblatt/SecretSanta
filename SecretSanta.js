import { drawNames, normalize, parseRules } from "./draw.js";
import { translations } from "./translations.js";
import { createEmailLink, isValidEmail } from "./email.js";
import { createGiftLink, readGiftLink } from "./parseQueryParams.js";

const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icons = {
  gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8C1 8 6-3 12 8Zm0 0C23 8 18-3 12 8Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m13 6 5 5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  sparkle: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
};
const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const STORE = "secret-santa-v2";
let storageBroken = false;
function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "null");
  } catch {
    return null;
  }
}
const stored = readStored();
const params = new URL(location.href).searchParams;
let language = ["en", "pt"].includes(params.get("lang"))
  ? params.get("lang")
  : stored?.language === "pt"
    ? "pt"
    : "en";
let people = Array.isArray(stored?.people)
  ? stored.people
      .filter(
        (p) =>
          p &&
          typeof p.id === "string" &&
          typeof p.name === "string" &&
          p.name.length <= 80 &&
          typeof p.preferences === "string" &&
          typeof p.aversions === "string",
      )
      .slice(0, 100)
      .map((p) => ({
        ...p,
        email: typeof p.email === "string" ? p.email.slice(0, 254) : "",
      }))
  : [];
let results =
  Array.isArray(stored?.results) && stored.results.length === people.length
    ? stored.results.filter((r) => {
        try {
          return (
            typeof r.giver === "string" &&
            new URL(r.url).origin === location.origin &&
            new URL(r.url).hash.startsWith("#gift=v1.")
          );
        } catch {
          return false;
        }
      })
    : [];
if (results.length !== people.length) results = [];
let view = results.length ? "results" : "group";
let editing = null,
  formDraft = { name: "", email: "", preferences: "", aversions: "" },
  rulesOpen = false;
let error = null,
  busy = false,
  gift = null,
  giftInvalid = false,
  giftRevealed = false,
  pendingAction = null;
const isGiftPage =
  new URLSearchParams(location.hash.slice(1)).has("gift") || params.has("name");
const t = (key, values = {}) =>
  (translations[language][key] || key).replace(
    /\{(\w+)\}/g,
    (_, k) => values[k] ?? "",
  );
function persist() {
  try {
    localStorage.setItem(STORE, JSON.stringify({ language, people, results }));
  } catch {
    storageBroken = true;
    toast(t("storageFail"));
  }
}
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 4200);
}
function header() {
  return `<header class="site-header"><a class="brand" href="${esc(location.pathname)}" aria-label="${esc(t("title"))}"><span class="brand-mark">${icon("gift")}</span><span class="brand-type"><strong>${t("title")}</strong><small>${t("tagline")}</small></span></a><div class="header-actions">${!isGiftPage ? `<a class="how-link" href="#how-it-works">${t("how")}</a>` : ""}<div class="languages" role="group" aria-label="${t("language")}"><button data-action="language" data-language="en" aria-pressed="${language === "en"}" lang="en">EN</button><span aria-hidden="true"></span><button data-action="language" data-language="pt" aria-pressed="${language === "pt"}" lang="pt-BR">PT</button></div></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><span>${icon("heart")} ${t("footer")}</span><small>${t("privacy")}</small></footer>`;
}
function hero() {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">${t("eyebrow")}</p><h1>${t("heroStart")}<br><em>${t("heroEnd")}</em></h1><p class="intro">${t("intro")}</p><div class="hero-notes"><span>${icon("check")}${t("free")}</span><span>${icon("check")}${t("account")}</span></div></div><div class="hero-art"><img src="gift.svg" alt="" width="470" height="330"><span class="art-note">${language === "pt" ? "com carinho, sempre." : "a little thought goes a long way."}</span></div></section>`;
}
function steps() {
  return `<ol class="steps" aria-label="${t("stepsLabel")}">${[1, 2, 3].map((n) => `<li class="${n === (results.length ? 3 : people.length >= 3 ? 2 : 1) ? "current" : ""}"><span class="step-number">0${n}</span><span>${t(`step${n}`)}</span>${n < 3 ? icon("arrow") : icon("sparkle")}</li>`).join("")}</ol>`;
}
function participant(person, i) {
  return `<li class="person-row"><span class="avatar avatar-${i % 4}" aria-hidden="true">${esc(
    person.name
      .split(" ")
      .filter(Boolean)
      .map((n) => [...n][0])
      .slice(0, 2)
      .join(""),
  )}</span><div class="person-info"><strong>${esc(person.name)}</strong>${person.email ? `<span class="person-email">${esc(person.email)}</span>` : ""}<div class="person-rules">${person.preferences ? `<span>${icon("heart")} ${t("prefers")}: ${esc(person.preferences)}</span>` : ""}${person.aversions ? `<span>${icon("lock")} ${t("avoids")}: ${esc(person.aversions)}</span>` : ""}${!person.preferences && !person.aversions ? `<span>${t("noRules")}</span>` : ""}</div></div><div class="row-actions"><button class="icon-button" data-action="edit" data-id="${esc(person.id)}" aria-label="${t("edit")} ${esc(person.name)}" title="${t("edit")}">${icon("edit")}</button><button class="icon-button remove" data-action="remove" data-id="${esc(person.id)}" aria-label="${t("remove")} ${esc(person.name)}" title="${t("remove")}">${icon("trash")}</button></div></li>`;
}
function group() {
  return `<div class="group-layout"><aside class="add-panel"><div class="panel-title"><span class="mini-icon">${icon("plus")}</span><h3>${t("addTitle")}</h3></div><form id="person-form" autocomplete="off"><label for="person-name">${t("name")}</label><input id="person-name" name="name" value="${esc(formDraft.name)}" placeholder="${t("namePlaceholder")}" maxlength="80" required><label class="email-field-label" for="person-email">${t("email")} <span>${t("optional")}</span></label><input id="person-email" name="email" type="email" inputmode="email" value="${esc(formDraft.email)}" placeholder="${t("emailPlaceholder")}" maxlength="254"><details class="matching-rules" ${rulesOpen ? "open" : ""}><summary>${t("rules")}<span>${t("optional")}</span>${icon("chevron")}</summary><div class="rules-fields"><p>${t("rulesHelp")}</p><label for="preferences">${t("preferences")}</label><input id="preferences" name="preferences" value="${esc(formDraft.preferences)}" placeholder="${t("prefPlaceholder")}" maxlength="1000" list="participant-names"><small>${t("preferredHelp")}</small><label for="aversions">${t("aversions")}</label><input id="aversions" name="aversions" value="${esc(formDraft.aversions)}" placeholder="${t("aversionPlaceholder")}" maxlength="1000" list="participant-names"><small>${t("excludedHelp")}</small></div></details><datalist id="participant-names">${people
    .filter((p) => p.id !== editing)
    .map((p) => `<option value="${esc(p.name)}"></option>`)
    .join(
      "",
    )}</datalist><button class="button add-button" type="submit">${icon(editing ? "check" : "plus")}${t(editing ? "save" : "add")}</button>${editing ? `<button class="text-button cancel-edit" type="button" data-action="cancel-edit">${t("cancel")}</button>` : ""}</form><p class="local-note">${icon("lock")}${t(storageBroken ? "storageFail" : "local")}</p></aside><section class="people-panel" aria-labelledby="people-heading"><div class="list-heading"><h3 id="people-heading">${t("people")}</h3><span class="count-badge">${people.length.toString().padStart(2, "0")}</span></div>${people.length ? `<ul class="people-list">${people.map(participant).join("")}</ul>` : `<div class="empty-state"><div class="empty-illustration">${icon("users")}<span class="tiny-sparkle">✧</span><span class="tiny-heart">♡</span></div><h3>${t("emptyTitle")}</h3><p>${t("emptyText")}</p></div>`}<div class="draw-footer"><span>${people.length < 3 ? t("minimumHelp") : t("ready")}</span><button class="button primary" data-action="draw" ${people.length < 3 || busy ? "disabled" : ""}>${icon("sparkle")}${t(busy ? "drawing" : "draw")}${icon("arrow")}</button></div></section></div>`;
}
function resultList() {
  return `<section class="results-panel"><div class="results-heading"><span class="result-seal">${icon("check")}</span><div><h3>${t("resultsTitle")}</h3><p>${t("resultsIntro")}</p></div></div><ul class="results-list">${results
    .map((r, i) => {
      const person = people.find((p) => p.name === r.giver);
      const email = person?.email || "";
      const mailto = createEmailLink({
        email: isValidEmail(email) ? email : "",
        name: r.giver,
        link: localizedLink(r.url),
        language,
      });
      return `<li class="result-row"><span class="avatar avatar-${i % 4}">${esc(
        r.giver
          .split(" ")
          .map((n) => [...n][0])
          .slice(0, 2)
          .join(""),
      )}</span><div class="person-info"><small>${t("resultLabel")}</small><strong>${esc(r.giver)}</strong></div><div class="result-share"><input class="result-email" type="email" inputmode="email" maxlength="254" data-email-index="${i}" value="${esc(email)}" placeholder="${t("emailOptional")}" aria-label="${esc(t("emailFor", { name: r.giver }))}"><div class="result-share-actions"><button class="button copy-button" data-action="copy" data-index="${i}" aria-label="${t("copy")} — ${esc(r.giver)}">${icon("copy")}<span>${t("copy")}</span></button><a class="button secondary email-button" data-action="email" data-index="${i}" href="${esc(mailto)}" aria-label="${t("emailLink")} — ${esc(r.giver)}">${icon("mail")}<span>${t("emailLink")}</span></a></div></div></li>`;
    })
    .join(
      "",
    )}</ul><p class="email-help">${icon("mail")}${t("emailHelp")}</p><p class="link-note">${icon("lock")}${t("linkNote")}</p><div class="results-actions"><button class="text-button" data-action="redraw">${icon("sparkle")}${t("redraw")}</button><button class="button secondary" data-action="copy-all">${icon("copy")}${t("copyAll")}</button></div></section>`;
}
function workspace() {
  return `<section class="workspace" id="exchange" aria-labelledby="workspace-heading"><div class="workspace-heading"><div><h2 id="workspace-heading">${t("workspace")}</h2><p>${t("workspaceSub")}</p></div>${people.length ? `<button class="text-button reset-button" data-action="reset">${t("startOver")}</button>` : `<span class="workspace-sparkle" aria-hidden="true">✧</span>`}</div>${results.length ? `<div class="view-tabs"><button data-action="group" aria-pressed="${view === "group"}">${icon("users")}${t("showGroup")}</button><button data-action="results" aria-pressed="${view === "results"}">${icon("gift")}${t("shareTab")}<span>${results.length}</span></button></div>` : ""}<div id="form-error" class="form-error" role="alert" tabindex="-1" ${!error ? "hidden" : ""}>${error ? esc(t(error.code, error)) : ""}</div>${view === "results" && results.length ? resultList() : group()}</section>`;
}
function help() {
  return `<section class="how-section" id="how-it-works"><p class="eyebrow">${t("helpEyebrow")}</p><h2>${t("helpTitle")}</h2><div class="help-grid">${[1, 2, 3].map((n) => `<article><span class="help-icon">${icon(["users", "heart", "gift"][n - 1])}</span><h3>${t(`help${n}`)}</h3><p>${t(`help${n}Text`)}</p></article>`).join("")}</div></section>`;
}
function revealPage() {
  return `<main class="reveal-page"><section class="reveal-card ${giftRevealed ? "is-revealed" : ""}"><p class="eyebrow">${t("revealEyebrow")}</p><img class="reveal-art" src="gift.svg" alt="" width="300" height="210">${giftInvalid ? `<h1>${t("invalidTitle")}</h1><p>${t("invalidText")}</p>` : giftRevealed ? `<p class="recipient-label">${t("buyingFor")}</p><h1 class="recipient-name">${esc(gift.recipient)}</h1><p>${t("revealAfter")}</p><button class="button secondary" data-action="hide">${icon("lock")}${t("hide")}</button>` : `${gift?.giver ? `<span class="for-name">${t("forName")} <strong>${esc(gift.giver)}</strong></span>` : ""}<h1>${t("revealTitle")}</h1><p>${t("revealIntro")}</p><button class="button primary" data-action="reveal" ${!gift ? "disabled" : ""}>${icon("gift")}${t("revealButton")}</button>`}</section><a class="text-button own-exchange" href="${esc(location.pathname)}?lang=${language}">${t("ownExchange")}${icon("arrow")}</a></main>`;
}
function render() {
  document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  document.title = `${t("title")} · ${language === "pt" ? "Uma tradição em família" : "A family tradition"}`;
  $("#app").innerHTML =
    `${header()}${isGiftPage ? revealPage() : `<main>${hero()}${steps()}${workspace()}${help()}</main>`}${footer()}`;
  const details = $(".matching-rules");
  if (details)
    details.addEventListener("toggle", () => {
      rulesOpen = details.open;
    });
}
function showError(value) {
  error = value;
  const node = $("#form-error");
  if (node) {
    node.textContent = t(value.code, value);
    node.hidden = false;
    node.focus();
  } else toast(t(value.code, value));
}
function ask(kind, action) {
  const dialog = $("#confirm-dialog");
  pendingAction = action;
  dialog.innerHTML = `<span class="dialog-icon">${icon("gift")}</span><h2 id="dialog-title">${t(`${kind}Title`)}</h2><p id="dialog-description">${t(`${kind}Text`)}</p><div class="dialog-actions"><button class="button secondary" data-dialog="cancel" autofocus>${t("dialogCancel")}</button><button class="button primary" data-dialog="confirm">${t("continue")}</button></div>`;
  dialog.showModal();
}
function mutate(action) {
  results.length
    ? ask("edit", () => {
        results = [];
        view = "group";
        action();
      })
    : action();
}
function clearForm() {
  editing = null;
  formDraft = { name: "", email: "", preferences: "", aversions: "" };
  rulesOpen = false;
}
async function doDraw() {
  if (busy) return;
  if (formDraft.name.trim()) {
    showError({ code: "draftNote" });
    return;
  }
  const outcome = drawNames(people);
  if (outcome.error) {
    showError(outcome.error);
    return;
  }
  busy = true;
  error = null;
  render();
  try {
    const links = await Promise.all(
      outcome.matches.map(async (m) => ({
        giver: m.giver,
        url: await createGiftLink(
          m.giver,
          m.recipient,
          language,
          location.href,
        ),
      })),
    );
    results = links;
    view = "results";
    persist();
  } catch {
    error = { code: "unexpected" };
  }
  busy = false;
  render();
  if (error) $("#form-error").focus();
  else
    ($(".results-heading h3").setAttribute("tabindex", "-1"),
      $(".results-heading h3").focus());
}
function localizedLink(link) {
  const url = new URL(link);
  url.searchParams.set("lang", language);
  return url.href;
}
async function copy(text, button, all = false) {
  try {
    await navigator.clipboard.writeText(text);
    if (button && !all) {
      button.innerHTML = `${icon("check")}<span>${t("copied")}</span>`;
      setTimeout(() => {
        if (button.isConnected)
          button.innerHTML = `${icon("copy")}<span>${t("copy")}</span>`;
      }, 2200);
    }
    toast(t(all ? "copiedAll" : "copied"));
  } catch {
    const dialog = $("#confirm-dialog");
    dialog.innerHTML = `<h2 id="dialog-title">${t("copyFallbackTitle")}</h2><p id="dialog-description">${t("copyFail")}</p><textarea class="copy-fallback" readonly aria-label="${t("copy")}">${esc(text)}</textarea><button class="button primary" data-dialog="cancel">${t("close")}</button>`;
    dialog.showModal();
    dialog.querySelector("textarea").select();
  }
}
$("#app").addEventListener("input", (event) => {
  if (event.target.matches(".result-email")) {
    const index = Number(event.target.dataset.emailIndex);
    const result = results[index];
    const person = people.find((p) => p.name === result.giver);
    const email = event.target.value.trim();
    if (person) {
      person.email = email;
      persist();
    }
    if (event.target.validity.valid && isValidEmail(email)) {
      event.target.closest(".result-row").querySelector(".email-button").href =
        createEmailLink({
          email,
          name: result.giver,
          link: localizedLink(result.url),
          language,
        });
    }
  }
  if (
    event.target.closest("#person-form") &&
    Object.hasOwn(formDraft, event.target.name)
  )
    formDraft[event.target.name] = event.target.value;
});
$("#app").addEventListener("submit", (event) => {
  if (event.target.id !== "person-form") return;
  event.preventDefault();
  const name = formDraft.name.trim().replace(/\s+/g, " ");
  if (!name) {
    showError({ code: "emptyName" });
    return;
  }
  if (
    people.some(
      (p) => p.id !== editing && normalize(p.name) === normalize(name),
    )
  ) {
    showError({ code: "duplicate" });
    return;
  }
  if (!editing && people.length >= 100) {
    showError({ code: "maximum" });
    return;
  }
  const save = () => {
    const existing = people.find((p) => p.id === editing);
    if (existing && normalize(existing.name) !== normalize(name)) {
      for (const person of people) {
        for (const key of ["preferences", "aversions"]) {
          const original = parseRules(person[key], people);
          if (original.includes(normalize(existing.name)))
            person[key] = original
              .map((rule) =>
                rule === normalize(existing.name)
                  ? name
                  : people.find((p) => normalize(p.name) === rule)?.name ||
                    rule,
              )
              .join(", ");
        }
      }
    }
    const person = {
      id: editing || crypto.randomUUID(),
      name,
      email: formDraft.email.trim(),
      preferences: formDraft.preferences.trim(),
      aversions: formDraft.aversions.trim(),
    };
    if (existing) people = people.map((p) => (p.id === editing ? person : p));
    else people.push(person);
    const message = t(existing ? "saved" : "added", { name });
    clearForm();
    error = null;
    persist();
    render();
    $("#person-name").focus();
    toast(message);
  };
  const existing = people.find((p) => p.id === editing);
  const onlyContactChanged =
    existing &&
    existing.name === name &&
    existing.preferences === formDraft.preferences.trim() &&
    existing.aversions === formDraft.aversions.trim();
  if (onlyContactChanged) save();
  else mutate(save);
});
$("#app").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || busy) return;
  const action = button.dataset.action;
  if (action === "language") {
    language = button.dataset.language;
    const nextUrl = new URL(location.href);
    nextUrl.searchParams.set("lang", language);
    history.replaceState(null, "", nextUrl);
    persist();
    error = null;
    render();
  }
  if (action === "cancel-edit") {
    clearForm();
    render();
  }
  if (action === "edit") {
    const p = people.find((p) => p.id === button.dataset.id);
    editing = p.id;
    formDraft = {
      name: p.name,
      email: p.email || "",
      preferences: p.preferences,
      aversions: p.aversions,
    };
    rulesOpen = !!(p.preferences || p.aversions);
    error = null;
    render();
    $("#person-name").focus();
  }
  if (action === "remove")
    mutate(() => {
      const p = people.find((p) => p.id === button.dataset.id);
      // Remove references as well, so deleting a person doesn't leave hidden stale rules.
      for (const person of people)
        for (const key of ["preferences", "aversions"]) {
          const rules = parseRules(person[key], people);
          if (rules.includes(normalize(p.name)))
            person[key] = rules
              .filter((r) => r !== normalize(p.name))
              .map(
                (r) => people.find((p) => normalize(p.name) === r)?.name || r,
              )
              .join(", ");
        }
      people = people.filter((person) => person.id !== p.id);
      if (editing === p.id) clearForm();
      error = null;
      persist();
      render();
      toast(t("removed", { name: p.name }));
    });
  if (action === "draw") results.length ? ask("redraw", doDraw) : doDraw();
  if (action === "redraw") ask("redraw", doDraw);
  if (action === "reset")
    ask("reset", () => {
      people = [];
      results = [];
      view = "group";
      clearForm();
      error = null;
      persist();
      render();
      toast(t("cleared"));
    });
  if (action === "email") {
    const input = button.closest(".result-row").querySelector(".result-email");
    if (!input.reportValidity() || !isValidEmail(input.value.trim())) {
      event.preventDefault();
      input.focus();
    }
  }
  if (action === "copy")
    copy(localizedLink(results[Number(button.dataset.index)].url), button);
  if (action === "copy-all")
    copy(
      results.map((r) => `${r.giver}\n${localizedLink(r.url)}`).join("\n\n"),
      button,
      true,
    );
  if (action === "group" || action === "results") {
    view = action;
    error = null;
    render();
  }
  if (action === "reveal" || action === "hide") {
    giftRevealed = action === "reveal";
    render();
  }
});
$("#confirm-dialog").addEventListener("click", (event) => {
  const choice = event.target.closest("[data-dialog]");
  if (!choice) return;
  const callback = pendingAction;
  pendingAction = null;
  $("#confirm-dialog").close();
  if (choice.dataset.dialog === "confirm") callback?.();
});
$("#confirm-dialog").addEventListener("cancel", () => {
  pendingAction = null;
});
// Hash-only navigation must also switch between organizer and reveal pages.
window.addEventListener("hashchange", () => {
  const hasGift =
    new URLSearchParams(location.hash.slice(1)).has("gift") ||
    new URL(location.href).searchParams.has("name");
  if (hasGift || hasGift !== isGiftPage) location.reload();
});
render();
if (isGiftPage) {
  try {
    gift = await readGiftLink(location.href);
    if (!gift) giftInvalid = true;
  } catch {
    giftInvalid = true;
  }
  render();
}
