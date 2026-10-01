/**
 * Memory-First Search: results logger.
 * Paste into Extensions > Apps Script of a new Google Sheet, set TOKEN, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). Copy the web app URL into Streamlit secrets as SHEET_WEBHOOK_URL.
 */
const TOKEN = 'mvp-google-photos';   // must match SHEET_TOKEN in Streamlit secrets

const TASK_COLS = ['Updated','Session','Participant','Version','Engine','Task','Cue','Target','Result','Time (s)',
  'Searched (S1)','Queries','Queries with results (S2)','Opened a result (S3)','Found via','Glow shown','Glow tapped',
  'Follow-up shown','Follow-up used','Wrong picks','AI answered','Queries typed'];
const SESSION_COLS = ['Updated','Session','Participant','Started','Finished','Order','First habit','Knows AI search',
  'Uses AI search','Permissions on','V1 ease','V1 trust','V1 comment','V2 ease','V2 trust','V2 comment',
  'Found V1 (of 5)','Found V2 (of 5)','Raw JSON'];

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.token !== TOKEN) return out({ ok: false, error: 'bad_token' });
  const s = body.session, now = new Date();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tasks = sheet(ss, 'Tasks', TASK_COLS), sessions = sheet(ss, 'Sessions', SESSION_COLS);
  const V = { C: 'Version 1', M: 'Version 2' }, ENGINE = { C: 'Keyword search', M: 'Memory-First Search' };
  (s.tasks || []).forEach(t => {
    const q = (t.events || []).filter(x => x.type === 'query');
    const sm = t.summary || {};
    upsert(tasks, s.sid + '|' + t.taskId, [now, s.sid, s.name, V[t.mode], ENGINE[t.mode], t.taskId, t.cue, t.target,
      t.result, Math.round(t.timeMs / 1000), sm.searched, sm.queries, sm.queriesWithResults, sm.openedFromResults,
      sm.foundVia || '', sm.nudgeShown, sm.nudgeTapped, sm.followupShown, sm.followupUsed, sm.wrongPicks,
      (t.events || []).some(x => x.type === 'ai_results'),
      q.map(x => '"' + x.q + '" (' + x.n + ')').join('; ')], 2, 6);
  });
  const a = s.answers || {}, r = s.ratings || {}, c = r.C || {}, m = r.M || {};
  const found = mode => (s.tasks || []).filter(t => t.mode === mode && t.result === 'found').length;
  upsert(sessions, s.sid, [now, s.sid, s.name, s.startedAt, s.finishedAt || '', s.order === 'CM' ? 'V1 then V2' : 'V2 then V1',
    a.habit || '', a.awareAI || '', a.usesAI || '', a.permissions || '', c.ease || '', c.trust || '', c.comment || '',
    m.ease || '', m.trust || '', m.comment || '', found('C'), found('M'), JSON.stringify(s).slice(0, 49000)], 2);
  return out({ ok: true });
}

function sheet(ss, name, cols) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); sh.getRange(1, 1, 1, cols.length).setFontWeight('bold'); }
  return sh;
}
// keyCol (1-based) holds the session id; optional keyCol2 is combined with it to form the row key
function upsert(sh, key, row, keyCol, keyCol2) {
  const vals = sh.getDataRange().getValues();
  for (let i = 1; i < vals.length; i++) {
    const k = keyCol2 ? vals[i][keyCol - 1] + '|' + vals[i][keyCol2 - 1] : String(vals[i][keyCol - 1]);
    if (k === key) { sh.getRange(i + 1, 1, 1, row.length).setValues([row]); return; }
  }
  sh.appendRow(row);
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
