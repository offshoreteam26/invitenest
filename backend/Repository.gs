/* =====================================================================
 * Repository – the ONLY file that reads or writes the Sheet.
 * ===================================================================== */

const SHEET_ID_KEY = 'SHEET_ID';

/** The InviteNest spreadsheet: the open one (editor/menu) or, for web requests, by its saved id. */
function db_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const id = PropertiesService.getScriptProperties().getProperty(SHEET_ID_KEY);
  if (!id) throw new AppError(500, 'Sheet id not saved – run rememberSheetId once in the editor');
  return SpreadsheetApp.openById(id);
}

/** Run ONCE from the editor: saves this Sheet's id so web requests can open it. */
function rememberSheetId() {
  const id = SpreadsheetApp.getActiveSpreadsheet().getId();
  PropertiesService.getScriptProperties().setProperty(SHEET_ID_KEY, id);
  console.log('Saved Sheet id: ' + id);
}

/** Text that Google Sheets would run as a formula (= + - @) is stored as plain text instead. */
const cellSafe_ = v => (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v;

class SheetRepository {
  constructor(tabName) {
    this.tabName = tabName;
    this.headers = SCHEMA[tabName];
  }

  sheet_() {
    const sh = db_().getSheetByName(this.tabName);
    if (!sh) throw new AppError(500, 'Missing tab: ' + this.tabName);
    return sh;
  }

  /** Every data row (records and empty rows) with its sheet row number. */
  rows_() {
    const sh = this.sheet_();
    const last = sh.getLastRow();
    if (last < 2) return { sh, rows: [] };
    const values = sh.getRange(2, 1, last - 1, this.headers.length).getValues();
    return { sh, rows: values.map((values, i) => ({ values, rowNumber: i + 2 })) };
  }

  toRecord_(values) { return Object.fromEntries(this.headers.map((h, i) => [h, values[i]])); }

  /** All real records (id filled in) as objects. */
  findAll() {
    return this.rows_().rows.filter(r => isRecord_(r.values)).map(r => this.toRecord_(r.values));
  }

  findBy(key, value)  { return this.findAll().filter(r => String(r[key]) === String(value)); }
  findOne(key, value) { return this.findBy(key, value)[0] || null; }

  /** Writes the record after the last real record. Every value is made formula-safe. */
  append(record) {
    const { sh, rows } = this.rows_();
    const lastRecord = rows.filter(r => isRecord_(r.values)).map(r => r.rowNumber).pop() || 1;
    const row = lastRecord + 1;
    if (row > sh.getMaxRows()) sh.insertRowAfter(sh.getMaxRows());
    sh.getRange(row, 1, 1, this.headers.length)
      .setValues([this.headers.map(h => cellSafe_(record[h] ?? ''))]);
  }

  /** Changes the given columns in every record where match(record) is true. Returns how many rows changed. */
  update(match, changes) {
    const { sh, rows } = this.rows_();
    let changed = 0;
    rows.filter(r => isRecord_(r.values) && match(this.toRecord_(r.values))).forEach(r => {
      Object.entries(changes).forEach(([key, value]) => {
        const col = this.headers.indexOf(key) + 1;
        if (col > 0) sh.getRange(r.rowNumber, col).setValue(cellSafe_(value));
      });
      changed++;
    });
    return changed;
  }
}

const Repos = {
  templates: () => new SheetRepository(TABS.TEMPLATES),
  events:    () => new SheetRepository(TABS.EVENTS),
  fields:    () => new SheetRepository(TABS.FIELDS),
  guests:    () => new SheetRepository(TABS.GUESTS),
  responses: () => new SheetRepository(TABS.RESPONSES)
};
