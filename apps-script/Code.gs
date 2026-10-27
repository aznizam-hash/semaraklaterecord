/**
 * Entry point API Rekod Lewat SEMARAK.
 * Semua respons guna format { ok: true, data } atau { ok: false, error }.
 *
 * Status: scaffold. Semua permintaan ditolak sehingga kaedah login diputuskan
 * (CLAUDE.md bahagian 5). Jangan tambah endpoint tanpa semakan peranan.
 */

// Sheet ID disimpan dalam Script Properties, bukan dalam kod (CLAUDE.md peraturan 6).
function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum ditetapkan dalam Script Properties.');
  return SpreadsheetApp.openById(id);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Halang formula injection (CLAUDE.md peraturan 4).
function sanitizeCell_(value) {
  var text = String(value == null ? '' : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function doGet(e) {
  return doRequest_(e);
}

function doPost(e) {
  return doRequest_(e);
}

function doRequest_(e) {
  try {
    // TODO: semak identiti dan peranan di sini (Auth.gs) sebelum routing.
    return jsonResponse_({ ok: false, error: 'Akses belum dikonfigurasi.' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Ralat pelayan.' });
  }
}
