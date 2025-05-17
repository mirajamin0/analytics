import cookie from 'cookie';

export default async function handler(req, res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('admin_token', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
    })
  );
  res.status(200).json({ success: true });
}
