
/* =========================================
   GOTEI THIRTEEN — INTERACTIVE GUILD ROSTER
   Version 0.3
   ========================================= */

// ARMORY LINKS
const ARMORY_BASE =
  "https://worldofwarcraft.blizzard.com/en-us/forever/us/armory/character/";

function getArmoryUrl(member) {
  // Use a custom link if one is provided.
  if (member.armory) return member.armory;

  // Otherwise generate the URL from their character name.
  const slug = member.name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${ARMORY_BASE}${slug}/`;
}

// GUILD RANKS
const rankOrder = {
  "Guild Master": 0,
  "Officer": 1,
  "Veteran": 2,
  "Initiate": 3,
  "Member": 4
};

// WORLD OF WARCRAFT CLASS COLORS
const classColors = {
  Warrior: "#c79c6e",
  Paladin: "#f58cba",
  Hunter: "#abd473",
  Rogue: "#fff569",
  Priest: "#ffffff",
  Shaman: "#0070de",
  Mage: "#69ccf0",
  Warlock: "#9482c9",
  Druid: "#ff7d0a"
};

const $ = (id) => document.getElementById(id);

let members = [];

// CREATE HTML ELEMENTS
function el(tag, className, text) {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;

  return node;
}

// =========================================
// ROLE ICONS
// =========================================

function getRoleSymbol(member) {
  switch (member.role) {
    case "Tank":
      return "🛡";

    case "Healer":
      return "✦";

    case "Flexible":
      return "🛡 ⚔";

    case "DPS":
    default:
      return "⚔";
  }
}

// =========================================
// CREATE MEMBER CARDS
// =========================================

function makeMemberCard(member) {
  const card = el(
    "article",
    "roster-card" + (member.featured ? " featured" : "")
  );

  // Character portrait and role symbol
  const portrait = el("div", "roster-portrait");

  portrait.appendChild(
    el("span", "portrait-symbol", getRoleSymbol(member))
  );

  card.appendChild(portrait);

  // Character information
  const body = el("div", "roster-card-body");

  body.appendChild(
    el("p", "rank-label", member.guildRank || "Member")
  );

  body.appendChild(
    el("h3", "", member.name)
  );

  // Race and class
  const classLine =
    [member.race, member.class].filter(Boolean).join(" ") ||
    "Class to be confirmed";

  const classNode = el("p", "character-class", classLine);

  if (member.class && classColors[member.class]) {
    classNode.style.color = classColors[member.class];
  }

  body.appendChild(classNode);

  // Special guild titles
  if (member.title) {
    body.appendChild(
      el("p", "character-detail", member.title)
    );
  }

  // Character specialization
  if (member.specialty) {
    body.appendChild(
      el("p", "character-detail", member.specialty)
    );
  }

  // Show general role if no title is defined
  if (
    !member.title &&
    member.role &&
    member.role !== "Unknown"
  ) {
    body.appendChild(
      el("p", "character-detail", member.role)
    );
  }

  // Armory link
  const link = el(
    "a",
    "roster-armory",
    "⚔ View Armory ↗"
  );

  link.href = getArmoryUrl(member);
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  link.setAttribute(
    "aria-label",
    `View ${member.name} on the WoW Forever Armory`
  );

  body.appendChild(link);

  card.appendChild(body);

  return card;
}

// =========================================
// SEARCH AND FILTERS
// =========================================

function render() {
  const query = $("member-search").value.trim().toLowerCase();
  const rank = $("rank-filter").value;
  const role = $("role-filter").value;
  const cls = $("class-filter").value;

  const result = members.filter((m) => {
    const matchesSearch =
      !query ||
      [
        m.name,
        m.guildRank,
        m.class,
        m.race,
        m.title,
        m.specialty
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesRank =
      rank === "All" || m.guildRank === rank;

    const matchesRole =
      role === "All" ||
      m.role === role ||
      (
        m.role === "Flexible" &&
        (role === "Tank" || role === "DPS")
      );

    const matchesClass =
      cls === "All" || m.class === cls;

    return (
      matchesSearch &&
      matchesRank &&
      matchesRole &&
      matchesClass
    );
  });

  const grid = $("roster-grid");

  grid.replaceChildren(
    ...result.map(makeMemberCard)
  );

  $("result-count").textContent =
    `${result.length} member${result.length === 1 ? "" : "s"} shown`;

  $("empty-state").hidden = result.length !== 0;
}

// =========================================
// LOAD GUILD MEMBERS
// =========================================

async function init() {
  const grid = $("roster-grid");

  try {
    const response = await fetch("members.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.members)) {
      throw new Error("Missing members array");
    }

    // =====================================
    // FEATURED CHARACTER ORDER
    // =====================================

    const featuredOrder = {
      "Bigbody Bess": 0,
      "Swaggu Beef": 1,
      "Shox Nbox": 2
    };

    members = data.members.sort((a, b) => {
      const aFeatured = featuredOrder[a.name] ?? 999;
      const bFeatured = featuredOrder[b.name] ?? 999;

      // Featured characters first
      if (aFeatured !== bFeatured) {
        return aFeatured - bFeatured;
      }

      // Then sort by guild rank
      const aRank = rankOrder[a.guildRank] ?? 99;
      const bRank = rankOrder[b.guildRank] ?? 99;

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      // Alphabetical order within ranks
      return a.name.localeCompare(b.name);
    });

    // =====================================
    // CLASS FILTER OPTIONS
    // =====================================

    const classes = [
      ...new Set(
        members.map((m) => m.class).filter(Boolean)
      )
    ].sort();

    for (const name of classes) {
      const option = el("option", "", name);

      option.value = name;

      $("class-filter").appendChild(option);
    }

    // =====================================
    // FILTER EVENT LISTENERS
    // =====================================

    for (const id of [
      "member-search",
      "rank-filter",
      "role-filter",
      "class-filter"
    ]) {
      $(id).addEventListener(
        id === "member-search" ? "input" : "change",
        render
      );
    }

    // Reset all filters
    $("clear-filters").addEventListener("click", () => {
      $("member-search").value = "";

      for (const id of [
        "rank-filter",
        "role-filter",
        "class-filter"
      ]) {
        $(id).value = "All";
      }

      render();
    });

    // Display roster
    render();

  } catch (error) {
    grid.replaceChildren(
      el(
        "p",
        "roster-error",
        "Could not load members.json. Open this page using VS Code Live Server (Go Live), not by double-clicking the HTML file."
      )
    );

    $("result-count").textContent = "Roster unavailable";

    console.error(
      "Gotei roster loading error:",
      error
    );
  }
}

document.addEventListener("DOMContentLoaded", init);
