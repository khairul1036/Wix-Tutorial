// ====================================================================================================
// backend/aiHomeReport.js
// ====================================================================================================

import { fetch } from 'wix-fetch';

// Use the same key that already worked for you before
const OPENAI_KEY = "sk-REPLACE_WITH_YOUR_OWN_KEY";

export async function generateHomeReport(formData) {
  try {
    if (!OPENAI_KEY) {
      return { error: "Missing OpenAI key in backend" };
    }

    const prompt = `
You are a real estate valuation assistant.

Using the property details below, estimate:
- As-Is Value range
- Light Rehab Value range (paint, flooring, minor updates)
- Full Rehab / After-Repair Value range (properly updated and competitive)

PROPERTY:
Address: ${formData.address}
Bedrooms: ${formData.bedrooms}
Bathrooms: ${formData.bathrooms}
Square feet: ${formData.sqft}
Year built: ${formData.yearBuilt}
Owner notes: ${formData.notes}

Respond EXACTLY in this format (no extra text before or after):

AS_IS_VALUE: $xxx–$yyy
LIGHT_REHAB_VALUE: $xxx–$yyy
FULL_REHAB_VALUE: $xxx–$yyy
REPORT:
<one or more paragraphs explaining your reasoning and the three value ranges in detail, friendly but professional tone>
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a conservative, realistic real estate valuation assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      return { error: `OpenAI error ${response.status}: ${text}` };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return { error: "No content returned from AI." };
    }

    // ----- PARSE THE SIMPLE TEXT FORMAT -----
    const lines = content.split('\n').map(l => l.trim());

    let asIsValue = "";
    let lightRehabValue = "";
    let fullRehabValue = "";
    let report = "";

    for (const line of lines) {
      const upper = line.toUpperCase();
      if (upper.startsWith("AS_IS_VALUE:")) {
        asIsValue = line.substring(line.indexOf(":") + 1).trim();
      } else if (upper.startsWith("LIGHT_REHAB_VALUE:")) {
        lightRehabValue = line.substring(line.indexOf(":") + 1).trim();
      } else if (upper.startsWith("FULL_REHAB_VALUE:")) {
        fullRehabValue = line.substring(line.indexOf(":") + 1).trim();
      }
    }

    // Find the REPORT: marker
    const reportIndex = lines.findIndex(l => l.toUpperCase().startsWith("REPORT:"));
    if (reportIndex >= 0) {
      report = lines.slice(reportIndex + 1).join('\n').trim();
    } else {
      // Fallback: whole content as report if marker missing
      report = content.trim();
    }

    // Basic sanity, but don't hard-error – just fill blanks if needed
    if (!asIsValue) asIsValue = "See report for details.";
    if (!lightRehabValue) lightRehabValue = "See report for details.";
    if (!fullRehabValue) fullRehabValue = "See report for details.";
    if (!report) report = content.trim();

    return {
      asIsValue,
      lightRehabValue,
      fullRehabValue,
      report
    };

  } catch (err) {
    console.error("Backend error in generateHomeReport:", err);
    return { error: err.message || String(err) };
  }
}



// ====================================================================================================
// frontend/home report form page code
// ====================================================================================================
import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { generateHomeReport } from 'backend/aiHomeReport';


$w.onReady(function () {
  console.log("Page ready – wiring submitButton (debug)");

  $w('#submitButton').onClick(async () => {
    console.log("submitButton clicked");

    if ($w('#errorText')) {
      $w('#errorText').text = "";
    }
    $w('#submitButton').label = "Working...";

    const formData = {
      address: $w('#addressInput').value,
      bedrooms: Number($w('#bedroomsInput').value),
      bathrooms: Number($w('#bathroomsInput').value),
      sqft: Number($w('#sqftInput').value),
      yearBuilt: Number($w('#yearBuiltInput').value),
      email: $w('#emailInput').value,
      notes: $w('#notesInput').value
    };

    console.log("Form data:", formData);

    const slug = formData.address
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let result;
    try {
      console.log("Calling backend generateHomeReport...");
      result = await generateHomeReport(formData);
      console.log("Backend result:", result);
    } catch (err) {
      console.error("AI/backend call error:", err);
      $w('#submitButton').label = "Error – Try Again";
      if ($w('#errorText')) {
        $w('#errorText').text = `AI/backend error: ${err.message || err}`;
      }
      return; // stop here
    }

    if (!result || !result.report) {
      const msg = result && result.error
        ? `Backend returned error: ${result.error}`
        : "Backend returned no report text.";
      console.error(msg);
      $w('#submitButton').label = "Error – Try Again";
      if ($w('#errorText')) {
        $w('#errorText').text = msg;
      }
      return;
    }

    const itemToSave = {
      title: formData.address,
      slug: slug,
      address: formData.address,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      sqft: formData.sqft,
      yearBuilt: formData.yearBuilt,
      email: formData.email,
      notes: formData.notes,
      asIsValue: result.asIsValue,
      lightRehabValue: result.lightRehabValue,
      fullRehabValue: result.fullRehabValue,
      aiReport: result.report
    };


    let savedItem;
    try {
      console.log("Inserting into AiReports:", itemToSave);
      savedItem = await wixData.insert("AiReports", itemToSave);
      console.log("Saved item:", savedItem);
    } catch (err) {
      console.error("Insert error:", err);
      $w('#submitButton').label = "Error – Try Again";
      if ($w('#errorText')) {
        $w('#errorText').text = `Insert error: ${err.message || err}`;
      }
      return; // stop here
    }

    // If we got this far, everything worked
    wixLocation.to(`/report/${savedItem.slug}`);
  });
});
