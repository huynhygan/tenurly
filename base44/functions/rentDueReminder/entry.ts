import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow both scheduled invocation (no user) and manual admin trigger
  let user = null;
  try { user = await base44.auth.me(); } catch { /* no-op for scheduled */ }
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const today = new Date();
  // Target date: 3 days from now
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + 3);
  const targetStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch all upcoming/due charges with due_date == target date
  const charges = await base44.asServiceRole.entities.RentCharge.filter({
    due_date: targetStr,
    status: 'upcoming',
  });

  if (charges.length === 0) {
    return Response.json({ message: 'No rent reminders to send today.', date: targetStr });
  }

  const results = [];

  for (const charge of charges) {
    // Get tenancy to find tenant email & name
    let tenantEmail = charge.tenant_email || null;
    let tenantName = 'Tenant';
    let rentFrequency = '';

    if (charge.tenancy_id) {
      const tenancies = await base44.asServiceRole.entities.Tenancy.filter({ id: charge.tenancy_id });
      if (tenancies.length > 0) {
        const tenancy = tenancies[0];
        tenantEmail = tenantEmail || tenancy.tenant_email;
        tenantName = tenancy.tenant_name || tenancy.tenant_email || 'Tenant';
        rentFrequency = tenancy.rent_frequency || '';
      }
    }

    if (!tenantEmail) {
      results.push({ charge_id: charge.id, status: 'skipped', reason: 'no tenant email' });
      continue;
    }

    // Get property name for context
    let propertyName = 'your property';
    if (charge.property_id) {
      const properties = await base44.asServiceRole.entities.Property.filter({ id: charge.property_id });
      if (properties.length > 0) {
        propertyName = properties[0].name || properties[0].address || propertyName;
      }
    }

    const amount = `$${(charge.amount || 0).toLocaleString()}`;
    const dueDateFormatted = new Date(targetStr + 'T00:00:00').toLocaleDateString('en-AU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const subject = `Reminder: Your rent of ${amount} is due in 3 days`;
    const body = `Hi ${tenantName},

This is a friendly reminder that your ${rentFrequency ? rentFrequency + ' ' : ''}rent payment is due in 3 days.

Property: ${propertyName}
Amount due: ${amount}
Due date: ${dueDateFormatted}

Please ensure your payment is made on time. If you have any questions, please contact your landlord directly.

Thank you,
Roomflo`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenantEmail,
      subject,
      body,
    });

    // Create an in-app notification for the tenant
    if (charge.tenant_id) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: charge.tenant_id,
        type: 'rent_due',
        title: `Rent due in 3 days – ${amount}`,
        body: `Your rent of ${amount} for ${propertyName} is due on ${dueDateFormatted}.`,
        link: '/rent',
      });
    }

    results.push({ charge_id: charge.id, tenant_email: tenantEmail, status: 'sent' });
  }

  return Response.json({
    date: targetStr,
    processed: charges.length,
    results,
  });
});