import { Resend } from "resend";

export type InquiryEmailData = {
  userName: string;
  userEmail: string;
  regNr: string;
  brand: string | null;
  model: string | null;
  year: string | null;
  description: string;
  services?: string[];
};

function esc(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Bygger HTML-e-posten som sendes til verkstedene.
 */
export function buildInquiryEmail(data: InquiryEmailData): {
  subject: string;
  html: string;
} {
  const brand = data.brand || "Ukjent merke";
  const model = data.model || "";
  const subject = `Ny forespørsel – ${brand} ${model} (${esc(
    data.regNr
  )})`.trim();

  const services = data.services ?? [];
  const servicesHtml =
    services.length > 0
      ? `<p style="margin:0 0 16px; font-size:15px; line-height:1.6;"><strong>Ønsket tjeneste:</strong> ${esc(
          services.join(", ")
        )}</p>`
      : "";

  const descriptionHtml = data.description
    ? `<h2 style="margin:24px 0 8px; font-size:15px; color:#3b5731;">Annet / mer detaljer</h2>
        <div style="padding:16px; background:#f0f5ee; border-left:3px solid #5f8a4e; border-radius:8px; font-size:15px; line-height:1.6; white-space:pre-wrap;">${esc(
          data.description
        )}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#faf8f3; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#221e19;">
  <div style="max-width:560px; margin:0 auto; padding:24px;">
    <div style="background:#ffffff; border:1px solid #e7dec8; border-radius:16px; overflow:hidden;">
      <div style="background:#3b5731; padding:20px 28px;">
        <p style="margin:0; color:#dce8d6; font-size:13px; letter-spacing:0.5px; text-transform:uppercase;">Omtur Vedlikehold</p>
        <h1 style="margin:6px 0 0; color:#ffffff; font-size:22px;">${esc(
          brand
        )} ${esc(model)}</h1>
      </div>

      <div style="padding:28px;">
        <p style="margin:0 0 20px; font-size:15px; line-height:1.5;">
          Du har mottatt en ny anbudsforespørsel fra en bileier i Rana.
        </p>

        <table style="width:100%; border-collapse:collapse; background:#f3efe4; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="padding:12px 16px; font-size:13px; color:#4a4137; width:120px;">Reg.nr</td>
            <td style="padding:12px 16px; font-size:15px; font-weight:600;">${esc(
              data.regNr
            )}</td>
          </tr>
          <tr style="background:#ece6d6;">
            <td style="padding:12px 16px; font-size:13px; color:#4a4137;">Merke</td>
            <td style="padding:12px 16px; font-size:15px;">${esc(
              data.brand
            ) || "–"}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px; font-size:13px; color:#4a4137;">Modell</td>
            <td style="padding:12px 16px; font-size:15px;">${esc(
              data.model
            ) || "–"}</td>
          </tr>
          <tr style="background:#ece6d6;">
            <td style="padding:12px 16px; font-size:13px; color:#4a4137;">Årsmodell</td>
            <td style="padding:12px 16px; font-size:15px;">${esc(
              data.year
            ) || "–"}</td>
          </tr>
        </table>

        <h2 style="margin:24px 0 8px; font-size:15px; color:#3b5731;">Hva bilen trenger hjelp med</h2>
        ${servicesHtml}${descriptionHtml}

        <h2 style="margin:24px 0 8px; font-size:15px; color:#3b5731;">Kunde</h2>
        <p style="margin:0; font-size:15px; line-height:1.6;">
          ${esc(data.userName)}<br />
          <a href="mailto:${esc(
            data.userEmail
          )}" style="color:#4a6e3c;">${esc(data.userEmail)}</a>
        </p>
      </div>

      <div style="padding:18px 28px; background:#f3efe4; border-top:1px solid #e7dec8;">
        <p style="margin:0; font-size:13px; line-height:1.5; color:#4a4137;">
          Kontakt kunden direkte for å gi tilbud. Denne forespørselen er sendt via
          <strong>Omtur Vedlikehold</strong> – <a href="https://omtur.no" style="color:#4a6e3c;">omtur.no</a>
        </p>
      </div>
    </div>

    <p style="margin:16px 4px 0; font-size:12px; color:#8a8275; line-height:1.5;">
      Godt vedlikehold forlenger bilens liv og reduserer klimaavtrykket.
    </p>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Sender e-post til en liste mottakere via Resend.
 * Returnerer antall vellykkede sendinger.
 */
export async function sendInquiryEmails(
  recipients: string[],
  data: InquiryEmailData
): Promise<number> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Mangler RESEND_API_KEY");
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildInquiryEmail(data);
  const from =
    process.env.RESEND_FROM || "Omtur Vedlikehold <vedlikehold@omtur.no>";

  let sent = 0;
  for (const to of recipients) {
    try {
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: data.userEmail,
        subject,
        html,
      });
      if (!error) sent += 1;
      else console.error("Resend-feil for", to, error);
    } catch (err) {
      console.error("Klarte ikke sende til", to, err);
    }
  }
  return sent;
}
