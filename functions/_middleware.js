/**
 * Cloudflare Pages Middleware — Basic Auth Password Gate
 *
 * Protects the entire site with HTTP Basic Authentication.
 * Set the following environment variables in Cloudflare Pages settings:
 *
 *   SITE_PASSWORD  — the password required to access the site
 *
 * To disable: remove this file or delete the SITE_PASSWORD environment variable.
 */

export async function onRequest(context) {
  const password = context.env.SITE_PASSWORD;

  // If no password is set, allow access (auth disabled)
  if (!password) {
    return context.next();
  }

  const auth = context.request.headers.get('Authorization');

  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic') {
      const decoded = atob(encoded);
      const [, pwd] = decoded.split(':');
      if (pwd === password) {
        return context.next();
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ADS Preview", charset="UTF-8"',
    },
  });
}
