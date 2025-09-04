import wixData from "wix-data";

$w.onReady(function () {
  $w("#dynamicDataset").onReady(() => {
    const product = $w("#dynamicDataset").getCurrentItem();
    if (!product) {
      console.warn("No product found");
      $w("#table1").collapse();
      $w("#table2").collapse();
      return;
    }

    // --------------------------
    // 🖼️ Image preview logic
    // --------------------------
    if (product.image1) $w("#previewImage").src = product.image1;

    const thumbnails = ["#image1", "#image2", "#image3", "#image4"];
    thumbnails.forEach((id, idx) => {
      const fieldKey = `image${idx + 1}`;
      const imageVal = product[fieldKey];
      if (imageVal) {
        $w(id).src = imageVal;
        $w(id).expand();
        $w(id).onClick(() => $w("#previewImage").src = imageVal);
      } else {
        $w(id).collapse();
      }
    });

    // --------------------------
    // Bind Key Benefits → #table1
    // --------------------------
    bindKeyBenefitsTable(product.keyBenefitsAndFeatures1);

    // --------------------------
    // Bind Specifications → #table2
    // --------------------------
    bindSpecificationsTable(product.specifications1);
  });
});

// --------------------------
// Function for Key Benefits Table
// --------------------------
function bindKeyBenefitsTable(rawValue) {
  const tableId = "#table1";
  if (!rawValue) {
    $w(tableId).collapse();
    return;
  }

  let parsed;
  try {
    parsed = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
  } catch (err) {
    console.error("Failed to parse keyBenefitsAndFeatures1 JSON:", err);
    $w(tableId).collapse();
    return;
  }

  if (!parsed || !parsed.columns || !parsed.rows) {
    console.warn("keyBenefitsAndFeatures1 has invalid structure");
    $w(tableId).collapse();
    return;
  }

  // Columns → header empty
  const cols = parsed.columns.map(col => ({
    id: String(col.key),
    dataPath: String(col.key),
    label: "", // header blank
    type: "string"
  }));
  $w(tableId).columns = cols;

  // 1st row (header values in bold)
  const headerRow = {};
  parsed.columns.forEach(col => {
    headerRow[col.key] = `${String(col.label || col.key)}`;
  });

  // Normal rows
  const rows = parsed.rows.map((row, idx) => ({ _id: String(idx + 1), ...row }));

  // Final rows
  $w(tableId).rows = [{ _id: "0", ...headerRow }, ...rows];
  $w(tableId).expand();
}

// --------------------------
// Function for Specifications Table
// --------------------------
function bindSpecificationsTable(rawValue) {
  const tableId = "#table2";
  if (!rawValue) {
    $w(tableId).collapse();
    return;
  }

  let parsed;
  try {
    parsed = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
  } catch (err) {
    console.error("Failed to parse specifications1 JSON:", err);
    $w(tableId).collapse();
    return;
  }

  if (!parsed || !parsed.columns || !parsed.data) {
    console.warn("specifications1 has invalid structure");
    $w(tableId).collapse();
    return;
  }

  // Columns → header empty
  const cols = parsed.columns.map(col => ({
    id: String(col.key),
    dataPath: String(col.key),
    label: "", // header blank
    type: "string"
  }));
  $w(tableId).columns = cols;

  // 1st row (header values in bold)
  const headerRow = {};
  parsed.columns.forEach(col => {
    headerRow[col.key] = `${String(col.label || col.key)}`;
  });

  // Normal rows
  const rows = parsed.data.map((row, idx) => ({ _id: String(idx + 1), ...row }));

  // Final rows
  $w(tableId).rows = [{ _id: "0", ...headerRow }, ...rows];
  $w(tableId).expand();
}
