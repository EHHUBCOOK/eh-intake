/**
 * EH LEADS — Google Apps Script Web App
 * Handles form submissions: logs to sheet, sends email, creates Drive folder structure
 *
 * Deploy as: Execute as Me / Anyone can access
 */

var SPREADSHEET_ID = '1UVtCQgUDThTd-BdCs5XyZx-AYeciiin1CCB5oOUD0pY';
var SHEET_NAME = 'EH LEADS';
var NOTIFY_EMAILS = ['russell@essentialherbs.com', 'loft12376@gmail.com'];
var EH_PROJECTS_FOLDER_ID = '12g6T9m_qIAF9_dH3SEEOsylXLhcJ3W-7';
var BUDGET_TEMPLATE_ID = '1st36Td2kf-L2-5qEQASNFN4gDRkDgTMmIvRiMayNXgM';

function doGet(e) {
  try {
    var p = e.parameter;

    // Health check (no name/email = ping)
    if (!p.name && !p.email) {
      return ContentService.createTextOutput(JSON.stringify({status:'live'})).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Log to sheet
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    sheet.appendRow([
      p.timestamp || new Date().toISOString(),
      p.name || '', p.email || '', p.phone || '',
      p.event_type || '', p.event_date || '', p.guest_count || '',
      p.venue || '', p.venue_help || '', p.service_style || '',
      p.food_notes || '', p.dietary || '', p.dietary_other || '',
      p.beverage || '', p.budget || '', p.beverage_budget || '',
      p.timeline || '', p.other_services || '', p.referral || '', p.notes || ''
    ]);

    // 2. Build folder name: MM.DD.YYYY MONTH - Client Name (Event Type)
    var folderName = buildFolderName(p);

    // 3. Create Drive folder structure
    var folderUrl = createFolderStructure(folderName, p);

    // 4. Send email notification
    var subject = 'New EH Inquiry: ' + (p.name || 'Unknown') + ' — ' + (p.event_type || 'Event');
    var body = 'New inquiry submitted via essentialherbs.com\n\n'
      + 'Name: ' + (p.name||'') + '\n'
      + 'Email: ' + (p.email||'') + '\n'
      + 'Phone: ' + (p.phone||'') + '\n'
      + 'Event Type: ' + (p.event_type||'') + '\n'
      + 'Event Date: ' + (p.event_date||'') + '\n'
      + 'Guest Count: ' + (p.guest_count||'') + '\n'
      + 'Venue: ' + (p.venue||'') + '\n'
      + 'Service Style: ' + (p.service_style||'') + '\n'
      + 'Dietary: ' + (p.dietary||'') + '\n'
      + 'Budget: ' + (p.budget||'') + '\n'
      + 'Timeline: ' + (p.timeline||'') + '\n'
      + 'Referral: ' + (p.referral||'') + '\n'
      + 'Notes: ' + (p.notes||'') + '\n\n'
      + 'Drive Folder: ' + folderUrl + '\n'
      + 'All Leads: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID;

    MailApp.sendEmail(NOTIFY_EMAILS.join(','), subject, body);

    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);

  } catch(err) {
    // Still return ok to the form — don't break the thank you screen
    Logger.log('Error: ' + err.toString());
    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) { return doGet(e); }

// ── Build folder name ─────────────────────────────────────────────────────────
function buildFolderName(p) {
  var date = p.event_date || '';
  var mm = '', dd = '', yyyy = '', monthName = '';
  var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  if (date) {
    var parts = date.split('-');
    if (parts.length === 3) {
      yyyy = parts[0];
      mm = parts[1].replace(/^0/, '');
      dd = parts[2].replace(/^0/, '');
      monthName = months[parseInt(parts[1]) - 1] || '';
    }
  }

  var clientName = (p.name || 'Inquiry').split(' ').slice(0,2).join(' ');
  var eventType = p.event_type || 'Event';

  if (mm && dd && yyyy) {
    return mm + '.' + dd + '.' + yyyy + ' ' + monthName + ' - ' + clientName + ' ' + eventType;
  } else {
    // No date — use today
    var now = new Date();
    var m = now.getMonth();
    return (m+1) + '.' + now.getDate() + '.' + now.getFullYear() + ' ' + months[m] + ' - ' + clientName + ' ' + eventType;
  }
}

// ── Create folder structure ───────────────────────────────────────────────────
function createFolderStructure(folderName, p) {
  var drive = DriveApp;

  // Event folder inside EH — Projects
  var projectsFolder = drive.getFolderById(EH_PROJECTS_FOLDER_ID);
  var eventFolder = projectsFolder.createFolder(folderName);

  // PRE-APPROVAL subfolder
  var preApprovalFolder = eventFolder.createFolder('PRE-APPROVAL');

  // Overview Google Doc
  createOverviewDoc(preApprovalFolder, folderName, p);

  // Budget Sheet (copy from template)
  try {
    var templateFile = drive.getFileById(BUDGET_TEMPLATE_ID);
    var budgetCopy = templateFile.makeCopy(folderName + ' — Budget', preApprovalFolder);
  } catch(err) {
    Logger.log('Budget template copy failed: ' + err.toString());
  }

  return 'https://drive.google.com/drive/folders/' + eventFolder.getId();
}

// ── Create Overview Doc ───────────────────────────────────────────────────────
function createOverviewDoc(folder, folderName, p) {
  var doc = DocumentApp.create(folderName + ' — Overview');

  // Move to PRE-APPROVAL folder
  var file = DriveApp.getFileById(doc.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  var body = doc.getBody();
  body.clear();

  // Title
  var title = body.appendParagraph('EVENT OVERVIEW — ' + folderName);
  title.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  title.editAsText().setBold(true).setFontSize(11).setFontFamily('Courier New');

  body.appendParagraph(p.event_date + ' | Status: PRE-APPROVAL')
    .editAsText().setFontFamily('Courier New').setFontSize(10);

  appendSection(body, 'CLIENT');
  appendLine(body, 'Name: ' + (p.name || ''));
  appendLine(body, 'Email: ' + (p.email || ''));
  appendLine(body, 'Phone: ' + (p.phone || ''));
  appendLine(body, 'Connection: ' + (p.referral || ''));

  appendSection(body, 'EVENT DETAILS');
  appendLine(body, 'Date: ' + (p.event_date || ''));
  appendLine(body, 'Time: ');
  appendLine(body, 'Venue: ' + (p.venue || ''));
  appendLine(body, 'Format: ' + (p.event_type || ''));
  appendLine(body, 'Guest Count: ' + (p.guest_count || ''));
  appendLine(body, 'Service Style: ' + (p.service_style || ''));

  appendSection(body, 'DIETARY');
  appendLine(body, p.dietary || '—');
  if (p.dietary_other) appendLine(body, 'Other: ' + p.dietary_other);

  appendSection(body, 'BUDGET NOTES');
  appendLine(body, 'Budget Range: ' + (p.budget || '—'));
  appendLine(body, 'Beverage Budget: ' + (p.beverage_budget || '—'));
  appendLine(body, 'Beverage: ' + (p.beverage || '—'));

  appendSection(body, 'OPEN QUESTIONS');
  appendLine(body, '— Confirm venue');
  appendLine(body, '— Confirm staffing needs');
  appendLine(body, '— Confirm rentals');

  appendSection(body, 'NOTES');
  appendLine(body, p.notes || '—');
  if (p.other_services) appendLine(body, 'Other services needed: ' + p.other_services);

  appendSection(body, 'COMMUNICATIONS LOG');
  appendLine(body, p.timestamp ? p.timestamp.split('T')[0] : new Date().toISOString().split('T')[0]);
  appendLine(body, '— Initial inquiry received via website');

  doc.saveAndClose();
  return doc.getId();
}

function appendSection(body, label) {
  var p = body.appendParagraph('\n' + label);
  p.editAsText().setBold(true).setFontFamily('Courier New').setFontSize(10);
}

function appendLine(body, text) {
  body.appendParagraph(text).editAsText().setBold(false).setFontFamily('Courier New').setFontSize(10);
}
