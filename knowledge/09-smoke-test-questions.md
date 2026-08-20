# Smoke test questions — 30% demo

Use these three questions in your final demo. Show **pass / fail** for each.

| # | Question | Expected source | Pass if |
| --- | --- | --- | --- |
| 1 | What room are judging and final demos in? | `event-day-briefing.md` | Answer cites **Hall B, Room 204** |
| 2 | What time is lunch today? | `event-day-briefing.md` | Answer cites **1:30 PM** (delayed) |
| 3 | What time are final demos? | `event-day-briefing.md` | Answer cites **4:00 PM** |

## How to demo

1. Admin publishes or updates `event-day-briefing.md` (or confirms it is indexed).
2. Wait up to ~60 seconds — member dashboard and chat should reflect the doc without a manual full-page refresh.
3. Ask each question in the member chat.
4. Show the source file name on every answer.
5. Display a simple pass/fail table in your UI or slides.

## Fail conditions

- Answer invents a room or time not in the briefing.
- Source missing or points to the wrong file.
- Member must hard-refresh the browser to get updated answers after admin publish.