exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const API_KEY = process.env.BREVO_API_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'api-key': API_KEY
  };

  // Step 1 — Add contact to YOLO10 Waitlist (list #7)
  const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: email,
      listIds: [7],
      updateEnabled: true,
      attributes: { SOURCE: 'YOLO10 Lander' }
    })
  });

  const contactStatus = contactRes.status;
  if (contactStatus !== 201 && contactStatus !== 204) {
    const data = await contactRes.json();
    if (data.code !== 'duplicate_parameter') {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to add contact' }) };
    }
  }

  // Step 2 — Send welcome email
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sender: { name: 'Stockologi', email: 'stockologi@gmail.com' },
      to: [{ email: email }],
      subject: "You're on the YOLO10 list — here's what's coming",
      textContent: `You're in.

YOLO10 drops soon. 10 stocks. 5 sectors. Two plays per sector — one the institutions already own, one retail can actually get rich on.

Every pick is CDF-scored across 8 criteria. Timestamped from day one. Track record fully public.

Here's how it works:

— INSTITUTIONAL pick: the safe money play institutions already hold. Solid thesis, lower risk, real upside.
— DEGEN pick: the asymmetric play retail can actually build wealth on. Higher risk, higher upside, full CDF breakdown so you know exactly what you're betting on.

When we go live you'll get the full YOLO10 list before anyone else sees it.

Stay sharp.

— Stockologi CDF Framework
yolo10.stockologi.com

---
NOT FINANCIAL ADVICE. For informational and research purposes only.`
    })
  });

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
