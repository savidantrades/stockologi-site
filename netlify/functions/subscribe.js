exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      email: email,
      listIds: [7],
      updateEnabled: true,
      attributes: { SOURCE: 'YOLO10 Lander' }
    })
  });

  const status = res.status;

  if (status === 201 || status === 204) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  const data = await res.json();
  if (data.code === 'duplicate_parameter') {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 500, body: JSON.stringify({ error: 'Failed' }) };
};
