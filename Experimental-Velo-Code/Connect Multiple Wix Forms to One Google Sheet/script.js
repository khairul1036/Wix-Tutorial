
function doPost(e) {
  try {

    const SHEET_ID = "1PlxjnW3bJZQO6vJMzOBgCXVqz5HdchV5lHQh0movCzY";
    const SHEET_NAME = "Sheet1";

    const sheet = SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName(SHEET_NAME);

    const data = JSON.parse(e.postData.contents);

    const email = data.email;
    const column = data.column;

    let col = 1;

    switch (column) {
      case "home":
        col = 1;
        break;

      case "support":
        col = 2;
        break;

      case "aftercare":
        col = 3;
        break;

      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            message: "Invalid column"
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }

    // Find first empty row in the selected column
    const values = sheet.getRange(1, col, sheet.getMaxRows()).getValues();

    let row = values.findIndex(r => r[0] === "") + 1;

    if (row === 0) {
      row = sheet.getLastRow() + 1;
    }

    sheet.getRange(row, col).setValue(email);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Saved Successfully",
        email: email,
        column: column
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: err.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } 
}

