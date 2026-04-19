const escapePdfText = (value = "") => value
  .replace(/\\/g, "\\\\")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)");

const buildPdfTextBlock = (lines) => [
  "BT",
  "/F1 28 Tf",
  "72 720 Td",
  ...lines.flatMap((line, index) => (
    index === 0
      ? [`(${escapePdfText(line)}) Tj`]
      : ["0 -36 Td", `(${escapePdfText(line)}) Tj`]
  )),
  "ET",
].join("\n");

export default async function generateCertificate({
  userName,
  eventTitle,
  position,
  issuedAt,
  organizerName,
}) {
  const text = buildPdfTextBlock([
    "Certificate of Achievement",
    `Presented to ${userName}`,
    `For securing position ${position}`,
    `At ${eventTitle}`,
    `Issued on ${issuedAt}`,
    `Organizer: ${organizerName}`,
  ]);

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text, "utf8")} >>\nstream\n${text}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}
