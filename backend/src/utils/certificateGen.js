// Placeholder for PDF certificate generation
// In production, use pdfkit or puppeteer to render a template.
module.exports = async function generateCertificate({
  userName,
  eventTitle,
  position,
}) {
  // Return dummy URL / path for now
  return `https://example.com/certificates/${encodeURIComponent(eventTitle)}-${encodeURIComponent(userName)}-${position}.pdf`;
};
