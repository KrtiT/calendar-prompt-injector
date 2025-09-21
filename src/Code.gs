// == Calendar Prompt Injector (Apps Script) ==
// Author: Krti Tallam
// Supports multiple events + prompt banks. See CONFIG and PROMPT_BANKS.

const CONFIG = {
  TZ: 'America/Los_Angeles',
  CAL_ID: 'primary',      // set to 'primary' or your calendar id
  TRIGGER_HOUR: 12,       // 12:45 PM local
  TRIGGER_MINUTE: 45,
  AUTO_MOVE: false,       // if true, attempt to move conflicting instance to first free 45m slot
  EVENTS: [
    { title: 'thinking walk', start: {h:13,m:0}, end: {h:13,m:45}, bank: 'default' },
    // { title: 'deep work 1', start: {h:7,m:0}, end: {h:8,m:45}, bank: 'research' },
  ],
};

// ---- Setup
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('updateToday')
    .timeBased()
    .atHour(CONFIG.TRIGGER_HOUR).nearMinute(CONFIG.TRIGGER_MINUTE)
    .inTimezone(CONFIG.TZ)
    .everyDays(1)
    .create();
  Logger.log(`Trigger installed: daily at ${CONFIG.TRIGGER_HOUR}:${CONFIG.TRIGGER_MINUTE.toString().padStart(2,'0')} (${CONFIG.TZ})`);
}

function uninstallTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('All triggers removed.');
}

// ---- Main
function updateToday() {
  const now = new Date();
  CONFIG.EVENTS.forEach(ev => updateOne(now, ev));
}

function updateOne(now, evCfg) {
  const winStart = dayTime(now, evCfg.start.h, evCfg.start.m);
  const winEnd   = dayTime(now, evCfg.end.h,   evCfg.end.m);

  let match = findEventInWindow(evCfg.title, winStart, winEnd);
  if (!match) {
    // try any instance today
    const ds = dayTime(now, 0, 0);
    const de = dayTime(now, 23, 59);
    match = findEventInWindow(evCfg.title, ds, de);
    if (!match) {
      Logger.log(`No "${evCfg.title}" found today.`);
      return;
    }
  }

  if (CONFIG.AUTO_MOVE && eventLooksConflicted(match)) {
    const moved = moveToFirstFree(now, match, 45);
    if (moved) match = moved;
  }

  const stamp  = Utilities.formatDate(now, CONFIG.TZ, 'EEE, MMM d');
  const prompt = pickPromptForDate(now, evCfg.bank || 'default');
  const header = `🧠 prompt (${stamp}): ${prompt}`;

  const existing = match.description || '';
  if (!existing.startsWith(`🧠 prompt (${stamp})`)) {
    Calendar.Events.patch({ description: `${header}\n\n${existing}`.trim() }, CONFIG.CAL_ID, match.id);
    Logger.log(`Updated "${evCfg.title}" with prompt: ${prompt}`);
  } else {
    Logger.log(`Prompt already present for "${evCfg.title}"`);
  }
}

// ---- Helpers
function findEventInWindow(title, start, end) {
  const res = Calendar.Events.list(CONFIG.CAL_ID, {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    q: title,
    maxResults: 20
  });
  return (res.items || []).find(e => (e.summary || '').trim().toLowerCase() === title.toLowerCase());
}

function pickPromptForDate(d, bankName) {
  const dow = ['sun','mon','tue','wed','thu','fri','sat'][d.getDay()];
  const bank = PROMPT_BANKS[bankName]?.[dow] || PROMPT_BANKS['default'][dow] || [];
  if (!bank.length) return 'set up your prompt bank in src/Prompts.gs';
  const seed = Number(Utilities.formatDate(d, CONFIG.TZ, 'yyyyMMdd'));
  let x = (seed ^ 0x9e3779b9) >>> 0;
  x = (1664525 * x + 1013904223) >>> 0;
  return bank[x % bank.length];
}

function dayTime(baseDate, h, m) {
  const s = new Date(baseDate);
  s.setHours(h, m, 0, 0);
  return new Date(Utilities.formatDate(s, CONFIG.TZ, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
}

function eventLooksConflicted(ev) {
  const hasGuests = (ev.attendees && ev.attendees.length) || ev.hangoutLink;
  return hasGuests || ev.transparency === 'opaque';
}

function moveToFirstFree(now, ev, minutes) {
  const needMs = minutes * 60 * 1000;
  const winStart = dayTime(now, 12, 15);
  const winEnd   = dayTime(now, 17, 0);
  const events = Calendar.Events.list(CONFIG.CAL_ID, {
    timeMin: winStart.toISOString(),
    timeMax: winEnd.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50
  }).items || [];
  let cursor = new Date(winStart);
  for (const e of events) {
    const s = new Date(e.start.dateTime || e.start.date);
    if (s - cursor >= needMs) {
      return Calendar.Events.patch(
        { start: { dateTime: cursor.toISOString() },
          end:   { dateTime: new Date(cursor.getTime() + needMs).toISOString() } },
        CONFIG.CAL_ID, ev.id
      );
    }
    const eEnd = new Date(e.end.dateTime || e.end.date);
    if (eEnd > cursor) cursor = eEnd;
  }
  if (winEnd - cursor >= needMs) {
    return Calendar.Events.patch(
      { start: { dateTime: cursor.toISOString() },
        end:   { dateTime: new Date(cursor.getTime() + needMs).toISOString() } },
      CONFIG.CAL_ID, ev.id
    );
  }
  Logger.log('No free slot found to move event.');
  return null;
}
