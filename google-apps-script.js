/**
 * EH LEADS — Google Apps Script Web App
 * Deploy as: Execute as ME / Anyone (even anonymous) can access
 *
 * 1. Go to script.google.com → New project → paste this code
 * 2. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy the deployment URL → paste into index.html as SHEET_URL
 */

var SHEET_NAME = 'EH LEADS';

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet + header row if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Event Type',
        'Event Date',
        'Guest Count',
        'Venue',
        'Venue Help',
        'Service Style',
        'Food Notes',
        'Dietary',
        'Dietary Other',
        'Beverage',
        'Budget',
        'Beverage Budget',
        'Timeline',
        'Other Services',
        'Referral',
        'Notes'
      ]);
      // Freeze header row
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.event_type || '',
      data.event_date || '',
      data.guest_count || '',
      data.venue || '',
      data.venue_help || '',
      data.service_style || '',
      data.food_notes || '',
      data.dietary || '',
      data.dietary_other || '',
      data.beverage || '',
      data.budget || '',
      data.beverage_budget || '',
      data.timeline || '',
      data.other_services || '',
      data.referral || '',
      data.notes || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test via GET (optional — for verifying deployment is live)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'live', sheet: SHEET_NAME }))
    .setMimeType(ContentService.MimeType.JSON);
}
