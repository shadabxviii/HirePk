/**
 * Normalize a single skill: lowercase, trim, collapse whitespace.
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== "string") return "";
  return skill.trim().toLowerCase().replace(/\s+/g, " ");
};

/**
 * Normalize an array or comma-separated string of skills.
 * Returns deduplicated, non-empty skill strings.
 */
export const normalizeSkills = (skills) => {
  if (!skills) return [];

  const list = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
      ? skills.split(",")
      : [];

  const seen = new Set();
  const result = [];

  for (const raw of list) {
    const normalized = normalizeSkill(raw);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
};

/**
 * Check if two skills match (exact or partial overlap).
 */
export const skillsMatch = (skillA, skillB) => {
  const a = normalizeSkill(skillA);
  const b = normalizeSkill(skillB);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
};

/**
 * Find skills from listA that match any skill in listB.
 */
export const findMatchingSkills = (listA, listB) => {
  const normalizedA = normalizeSkills(listA);
  const normalizedB = normalizeSkills(listB);

  return normalizedB.filter((jobSkill) =>
    normalizedA.some((userSkill) => skillsMatch(userSkill, jobSkill))
  );
};
