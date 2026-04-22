// SF Climate Week 2026 Happy Hour — Check-in Script
// Deploy as: Web App → Execute as: Me → Who has access: Anyone

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var params = JSON.parse(e.postData.contents);
    var inputEmail = (params.email || "").toLowerCase().trim();
    var inputName  = (params.name  || "").toLowerCase().trim();

    // Column indexes (0-based)
    var nameCol        = headers.indexOf("Name");
    var emailCol       = headers.indexOf("Email");
    var checkedInCol   = headers.indexOf("Checked In");
    var checkinTimeCol = headers.indexOf("Check-in Time");

    for (var i = 1; i < data.length; i++) {
      var rowEmail = (data[i][emailCol] || "").toString().toLowerCase().trim();

      if (rowEmail === inputEmail) {
        var rowName = (data[i][nameCol] || "").toString();

        // Already checked in?
        if ((data[i][checkedInCol] || "").toString().toLowerCase() === "yes") {
          return json({ success: false, alreadyCheckedIn: true, name: rowName });
        }

        // Mark checked in
        sheet.getRange(i + 1, checkedInCol   + 1).setValue("Yes");
        sheet.getRange(i + 1, checkinTimeCol + 1).setValue(
          Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy HH:mm:ss")
        );

        var company = (data[i][headers.indexOf("Company")] || "").toString();
        return json({ success: true, name: rowName, company: company });
      }
    }

    // Email not found — add them as a walk-in and check them in
    var inputNameFormatted = params.name || "";
    sheet.appendRow([
      inputNameFormatted,
      params.email || "",
      "", "", "", "",   // Title, Company, Location, LinkedIn
      "Yes",            // Checked In
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy HH:mm:ss"),
      "Walk-in"         // extra note column
    ]);

    return json({ success: true, walkin: true, name: inputNameFormatted });

  } catch (err) {
    return json({ success: false, error: err.message });
  }
}

// Allow browser preflight / health check
function doGet(e) {
  return ContentService
    .createTextOutput("SF Climate Week check-in API is running ✓")
    .setMimeType(ContentService.MimeType.TEXT);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
