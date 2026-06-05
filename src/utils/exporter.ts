/**
 * Gideons International Ministries Kenya (GIMK)
 * Export Utility System - Handles CSV, ICS and local file persistence
 */

export function downloadCSV(data: any[], headers: string[], filename: string) {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  const csvRows = [];
  
  // 1. Add headers
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","));

  // 2. Add rows
  for (const item of data) {
    const values = headers.map(header => {
      // Get value (handling nested or calculated attributes if needed)
      const key = header.toLowerCase().replace(/\s+/g, '_');
      let val = item[key];
      
      // Fallback mappings for common header keys
      if (val === undefined) {
        if (header === "ID") val = item.id;
        else if (header === "First Name") val = item.first_name;
        else if (header === "Last Name") val = item.last_name;
        else if (header === "Join Date") val = item.join_date;
        else if (header === "Birth Date") val = item.birth_date;
        else if (header === "Family Role") val = item.family_role;
        else if (header === "Registered Ministries") val = item.ministries_list || item.ministries?.map((m: any) => m.name).join(", ");
        else if (header === "Date") val = item.date;
        else if (header === "Amount") val = item.amount;
        else if (header === "Type") val = item.type;
        else if (header === "Payment Method") val = item.payment_method;
        else if (header === "Notes") val = item.notes;
        else if (header === "Title") val = item.title;
        else if (header === "Preacher/Speaker") val = item.speaker;
        else if (header === "Scripture Reference") val = item.scripture;
        else if (header === "Content Summary") val = item.content;
      }

      if (val === null || val === undefined) {
        return '""';
      }
      
      const strVal = String(val);
      // Escape inner quotes
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  // Define blob and trigger download
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a list of church events as a compatible iCalendar (.ics) file
 */
export function downloadICS(events: any[], filename: string = "sanctuary-calendar") {
  if (!events || !events.length) {
    alert("No calendar events to download.");
    return;
  }

  let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Gideons International Ministries Kenya//NONSGML Calendar//EN\r\n";

  for (const ev of events) {
    // Format date from YYYY-MM-DD to YYYYMMDD
    const rawDate = ev.date ? ev.date.replace(/-/g, "") : "20260603";
    const startHourMin = ev.start_time ? ev.start_time.replace(/:/g, "") : "090000";
    const endHourMin = ev.end_time ? ev.end_time.replace(/:/g, "") : "110000";

    const dtStart = `${rawDate}T${startHourMin}00`;
    const dtEnd = `${rawDate}T${endHourMin}00`;
    
    icsContent += "BEGIN:VEVENT\r\n";
    icsContent += `SUMMARY:${ev.title || "Sanctuary Event"}\r\n`;
    icsContent += `DTSTART:${dtStart}\r\n`;
    icsContent += `DTEND:${dtEnd}\r\n`;
    if (ev.location) {
      icsContent += `LOCATION:${ev.location}\r\n`;
    }
    if (ev.description) {
      icsContent += `DESCRIPTION:${ev.description.replace(/\n/g, "\\n")}\r\n`;
    }
    icsContent += "END:VEVENT\r\n";
  }

  icsContent += "END:VCALENDAR\r\n";

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.ics`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers printing of a customized layout block or the screen tables nicely
 */
export function triggerPrintLayout(elementId: string, title: string = "GIMK System Statement") {
  const printEl = document.getElementById(elementId);
  if (!printEl) {
    alert("Could not locate print visual area");
    return;
  }

  // Create a clean layout in a wrapper or handle iframe state safely
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Falls back to direct browser printing of current view
    window.print();
    return;
  }

  // Grab active styles to preserve layout aesthetics
  let stylesHtml = "";
  const stylesheets = Array.from(document.styleSheets);
  for (const sheet of stylesheets) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      stylesHtml += rules.map(rule => rule.cssText).join("\n");
    } catch (e) {
      // Safe guard cross-origin errors
    }
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${stylesHtml}
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #fff !important; 
            padding: 24px !important;
            color: #2D3E50 !important;
          }
          .no-print { display: none !important; }
        </style>
      </head>
      <body>
        <div style="border-bottom: 2px solid #C5A059; padding-bottom: 12px; margin-bottom: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; text-transform: uppercase;">Gideons International Ministries Kenya</h1>
          <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #7f8c8d;">
            Official HQ Ledger Report & Digital Statement
          </p>
          <p style="margin: 2px 0 0; font-size: 10px; color: #95a5a6;">Printed: ${new Date().toLocaleString()}</p>
        </div>
        <div>
          ${printEl.innerHTML}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  // Timeout gives system styles time to bind before print opens
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 350);
}
