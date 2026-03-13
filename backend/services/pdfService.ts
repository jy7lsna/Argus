import PDFDocument from 'pdfkit';

const PdfService = {
  /**
   * Generates a professional security report in PDF format.
   * 
   * @param {Object} analysis - Full analysis object with assets and history
   * @param {Object} res - Express response object to stream the PDF
   */
  generateReport: (analysis: any, res: any) => {
    // Enable bufferPages to allow doc.switchToPage later for the footer
    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    // Stream the generated PDF directly to the response
    doc.pipe(res);

    // --- Header ---
    doc.fontSize(24).text('Argus Security Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Domain: ${analysis.domain}`, { align: 'left' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' });
    doc.moveDown();
    doc.rect(50, doc.y, 500, 2).fill('#333');
    doc.moveDown(2);

    // --- Executive Summary ---
    doc.fontSize(18).text('Executive Summary', { underline: true });
    doc.moveDown();

    // Overall Risk Score Box
    const startY = doc.y;
    doc.rect(50, startY, 200, 80).stroke();
    doc.fontSize(12).text('Overall Risk Score', 60, startY + 15);
    doc.fontSize(32).fillColor(getRiskColor(analysis.overallRiskScore)).text(analysis.overallRiskScore.toString(), 60, startY + 35);
    doc.fillColor('black');

    // Risk Level Box
    doc.rect(300, startY, 200, 80).stroke();
    doc.fontSize(12).text('Impact Level', 310, startY + 15);
    doc.fontSize(24).fillColor(getRiskColor(analysis.overallRiskScore)).text(analysis.overallRiskLevel, 310, startY + 40);
    doc.fillColor('black');

    doc.moveDown(5);

    // --- Asset Summary ---
    doc.fontSize(18).text('Critical Assets Discovery', { underline: true });
    doc.moveDown();

    // Sort assets and take top 5
    const topAssets = (analysis.assets || [])
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    if (topAssets.length > 0) {
      topAssets.forEach((asset, index) => {
        doc.fontSize(14).text(`${index + 1}. ${asset.name} (${asset.type})`, { bulletRadius: 2 });
        doc.fontSize(10).text(`URL: ${asset.url}`);
        doc.fillColor(getRiskColor(asset.riskScore)).text(`Risk Score: ${asset.riskScore} [${asset.riskLevel}]`);
        doc.fillColor('black');
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(12).text('No high-risk assets detected.');
    }

    doc.moveDown(2);

    // --- Business Impact Summary ---
    doc.fontSize(18).text('Business Impact Analysis', { underline: true });
    doc.moveDown();

    const totalAssets = analysis.totalAssets || 0;
    const criticalCount = analysis.criticalAssets || 0;
    const highCount = analysis.highRiskAssets || 0;

    doc.fontSize(12).text(`Total Assets Analyzed: ${totalAssets}`);
    doc.text(`Critical Vulnerabilities: ${criticalCount}`);
    doc.text(`High Risk Exposures: ${highCount}`);
    doc.moveDown();
    doc.text('This organization is currently exposed to potential surface attacks. Immediate remediation of the top critical assets listed above is highly recommended to improve the security posture.', {
      align: 'justify'
    });

    // --- Footer ---
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
    }

    doc.end();
  }
};

function getRiskColor(score: number) {
  if (score >= 81) return '#e74c3c'; // Critical
  if (score >= 61) return '#e67e22'; // High
  if (score >= 41) return '#f1c40f'; // Medium
  return '#2ecc71'; // Low
}

export default PdfService;
