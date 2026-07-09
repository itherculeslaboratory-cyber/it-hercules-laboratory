/** Simulate 10 pairwise rounds → example preference_profile_mock JSON */
import {
  buildProfileFromSession,
  getCurrentPair,
  pairKey,
  MOCK_SPECIMENS,
} from "../src/w2/preference-profile-lab.ts";

const session = {
  phase: "pairwise",
  round: 0,
  pairIndex: 0,
  votes: [],
  valueChecks: [],
  usedPairKeys: [],
};

// Bias: prefer larger body, thicker horn, black color (simulated user)
function autoChoice(left, right) {
  const leftScore =
    left.bodyLengthMm * 2 +
    left.hornLengthMm +
    (left.traits.color === "black" ? 20 : 0) +
    (left.traits.horn === "thick" ? 15 : 0);
  const rightScore =
    right.bodyLengthMm * 2 +
    right.hornLengthMm +
    (right.traits.color === "black" ? 20 : 0) +
    (right.traits.horn === "thick" ? 15 : 0);
  if (Math.abs(leftScore - rightScore) < 5) return "neither";
  return leftScore >= rightScore ? "left" : "right";
}

for (let i = 0; i < 10; i++) {
  const [left, right] = getCurrentPair(session);
  const choice = autoChoice(left, right);
  session.votes.push({
    choice,
    left: left.traits,
    right: right.traits,
    leftId: left.id,
    rightId: right.id,
  });
  session.usedPairKeys.push(pairKey(left.id, right.id));
  session.round += 1;
  session.pairIndex += 1;
}

const profile = buildProfileFromSession(session);
console.log(JSON.stringify(profile, null, 2));
