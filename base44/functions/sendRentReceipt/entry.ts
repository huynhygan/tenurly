import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  const body = await req.json();
  const base44 = createClientFromRequest(req);

  // Only act on RentCharge confirmed updates
  const { event, data, old_data } = body;
  if (event?.type !== 'update') return Response.json({ status: 'skipped' });
  if (data?.status !== 'confirmed') return Response.json({ status: 'skipped' });
  if (old_data?.status === 'confirmed') return Response.json({ status: 'already_confirmed' });

  const charge = data;

  // Get tenant email from the tenancy
  let tenantEmail = null;
  let tenantName = 'Tenant';
  let propertyName = 'your property';

  try {
    const tenancies = await base44.asServiceRole.entities.Tenancy.filter({ id: charge.tenancy_id });
    const tenancy = tenancies[0];
    if (tenancy) {
      tenantEmail = tenancy.tenant_email;
      tenantName = tenancy.tenant_name || tenancy.tenant_email;
    }
  } catch (_) {}

  try {
    const properties = await base44.asServiceRole.entities.Property.filter({ id: charge.property_id });
    if (properties[0]) propertyName = properties[0].name || properties[0].address;
  } catch (_) {}

  if (!tenantEmail) {
    return Response.json({ status: 'no_tenant_email' }, { status: 400 });
  }

  // Get Gmail access token
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

  const amount = `$${(charge.amount || 0).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;
  const paidDate = charge.paid_date
    ? new Date(charge.paid_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  const dueDate = charge.due_date
    ? new Date(charge.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const subject = `Rent Receipt – ${paidDate}`;

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
  <div style="background: #0f9e7e; padding: 28px 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">Rent Receipt</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">${propertyName}</p>
  </div>
  <div style="background: #f9fafb; padding: 28px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0 0 20px;">Hi ${tenantName},</p>
    <p style="margin: 0 0 20px;">Your rent payment has been received and confirmed. Here's your receipt:</p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Amount Paid</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 700; font-size: 18px; color: #0f9e7e;">${amount}</td>
      </tr>
      ${dueDate ? `<tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Period Due</td>
        <td style="padding: 10px 0; text-align: right; font-size: 14px;">${dueDate}</td>
      </tr>` : ''}
      <tr>
        <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Confirmed On</td>
        <td style="padding: 10px 0; text-align: right; font-size: 14px;">${paidDate}</td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 13px; color: #6b7280;">Please keep this email as proof of payment. If you have any questions, contact your landlord.</p>
  </div>
</body>
</html>`;

  // Build RFC 2822 email and base64url encode it
  const emailLines = [
    `To: ${tenantEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
  ].join('\r\n');

  const encoded = btoa(unescape(encodeURIComponent(emailLines)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!sendRes.ok) {
    const err = await sendRes.text();
    return Response.json({ status: 'gmail_error', detail: err }, { status: 500 });
  }

  return Response.json({ status: 'sent', to: tenantEmail });
});