export function buildEmailHtml(bodyText: string, companyName: string): string {
  const htmlBody = bodyText.replace(/\n/g, "<br>");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="border-bottom: 2px solid #4a6b4e; padding-bottom: 12px; margin-bottom: 24px;">
        <h2 style="color: #4a6b4e; margin: 0;">CertiRecicla</h2>
      </div>
      <div style="line-height: 1.6;">
        ${htmlBody}
      </div>
      <div style="border-top: 1px solid #e8e4dc; margin-top: 32px; padding-top: 12px;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          Emitido por ${companyName} a través de CertiRecicla
        </p>
      </div>
    </div>
  `;
}
