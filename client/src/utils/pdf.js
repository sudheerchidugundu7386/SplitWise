import { jsPDF } from "jspdf";

/**
 * Generate and download a PDF summary of the group's expenses and settlements.
 *
 * @param {Object} group     - Group document { name, members, groupId }
 * @param {Array}  expenses  - Array of expense documents
 * @param {Array}  balances  - Array of { member, net }
 * @param {Array}  settlements - Array of { from, to, amount }
 */
export function exportPDF(group, expenses, balances, settlements) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ── Helper: add text and advance y ──
  const addLine = (text, size = 10, style = "normal", color = [15, 23, 42]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    doc.text(text, 14, y);
    y += size * 0.5 + 2;
  };

  const addSeparator = () => {
    doc.setDrawColor(226, 232, 240); // Light gray line
    doc.setLineWidth(0.3);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;
  };

  const checkPageOverflow = () => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // ── Header (Dark Background) ──
  doc.setFillColor(15, 11, 42);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(129, 140, 248);
  doc.text("SplitWise", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Smart Group Bill Splitter", 14, 26);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 34);
  y = 50;

  // ── Group Info (White Background) ──
  addLine(`Group: ${group.name}`, 16, "bold", [15, 23, 42]);
  addLine(`Members: ${group.members.map((m) => m.name).join(", ")}`, 10, "normal", [71, 85, 105]);
  addLine(`Group ID: ${group.groupId}`, 9, "normal", [148, 163, 184]);
  y += 4;
  addSeparator();

  // ── Expenses Table ──
  addLine("EXPENSES", 13, "bold", [79, 70, 229]);
  y += 2;

  if (expenses.length === 0) {
    addLine("No expenses recorded.", 10, "italic", [100, 116, 139]);
  } else {
    // Table header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Description", 14, y);
    doc.text("Amount", 90, y);
    doc.text("Paid By", 125, y);
    doc.text("Date", 160, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);

    expenses.forEach((exp) => {
      checkPageOverflow();
      doc.setFontSize(9);
      doc.text(exp.description.substring(0, 30), 14, y);
      doc.text(`Rs. ${exp.amount.toFixed(2)}`, 90, y);
      doc.text(exp.paidBy, 125, y);
      doc.text(new Date(exp.createdAt).toLocaleDateString("en-IN"), 160, y);
      y += 5;
    });
  }

  y += 4;
  addSeparator();

  // ── Balances ──
  addLine("NET BALANCES", 13, "bold", [79, 70, 229]);
  y += 2;

  balances.forEach((b) => {
    checkPageOverflow();
    const isPos = b.net >= 0;
    const color = isPos ? [22, 163, 74] : [220, 38, 38]; // Green : Red
    const bgColor = isPos ? [220, 252, 231] : [254, 226, 226]; // Light green : Light red
    const sign = isPos ? "+" : "-";
    const amtStr = `${sign} Rs. ${Math.abs(b.net).toFixed(2)}`;
    
    // Row background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, y - 5, pageWidth - 28, 8, 1, 1, "F");

    // Member name
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(b.member, 18, y);

    // Amount badge
    doc.setFontSize(9);
    const amtWidth = doc.getTextWidth(amtStr);
    const badgeX = pageWidth - 18 - amtWidth - 4;
    doc.setFillColor(...bgColor);
    doc.roundedRect(badgeX, y - 4, amtWidth + 8, 6, 1, 1, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(amtStr, badgeX + 4, y + 0.5);

    y += 10;
  });

  y += 2;
  addSeparator();

  // ── Settlements ──
  addLine("SETTLEMENTS", 13, "bold", [79, 70, 229]);
  y += 2;

  if (settlements.length === 0) {
    addLine("All settled! No payments needed.", 10, "normal", [22, 163, 74]);
  } else {
    settlements.forEach((s, i) => {
      checkPageOverflow();
      
      // Row background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y - 5, pageWidth - 28, 8, 1, 1, "F");

      // Number
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`${i + 1}.`, 18, y);

      let currentX = 26;

      // From (Red)
      doc.setTextColor(220, 38, 38);
      doc.text(s.from, currentX, y);
      currentX += doc.getTextWidth(s.from) + 2;

      // "pays" (Slate)
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("pays", currentX, y);
      currentX += doc.getTextWidth("pays") + 2;

      // To (Green)
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(s.to, currentX, y);

      // Amount (Right-aligned)
      doc.setTextColor(15, 23, 42); // slate-900
      const amtStr = `Rs. ${s.amount.toFixed(2)}`;
      doc.text(amtStr, pageWidth - 18 - doc.getTextWidth(amtStr), y);

      y += 10;
    });
  }

  // ── Footer ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `SplitWise — Page ${p} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Download
  doc.save(`${group.name.replace(/\s+/g, "_")}_expenses.pdf`);
}
