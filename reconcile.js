const fs = require("fs");

const latest = new Map();

const lines = fs.readFileSync("payments.jsonl", "utf8").split(/\r?\n/);

for (const line of lines) {
  if (!line.trim()) continue;

  try {
    const event = JSON.parse(line);

    if (!event.txn_id) continue;

    const timestamp = Date.parse(event.ts);

    if (Number.isNaN(timestamp)) continue;

    const previous = latest.get(event.txn_id);

    if (!previous || timestamp >= previous.timestamp) {
      latest.set(event.txn_id, {
        timestamp,
        event
      });
    }
  } catch {
    continue;
  }
}

let total = 0;
let count = 0;

for (const { event } of latest.values()) {
  if (event.status === "success") {
    total += Number(String(event.amount).replace(/,/g, ""));
    count++;
  }
}

const expected = parseInt(
  fs.readFileSync("expected.txt", "utf8").trim(),
  10
);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
