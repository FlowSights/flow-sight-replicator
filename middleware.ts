export function middleware(request: Request) {
  const nonce = btoa(crypto.randomUUID());
  const vercelEnv = process.env.VERCEL_ENV || 'development'; // Default to development if not set

  let csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.googleapis.com https://www.instagram.com https://platform.instagram.com https://js.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.supabase.co https://*.googleapis.com https://storage.googleapis.com https://*.cdninstagram.com https://www.instagram.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://*.googleapis.com https://www.instagram.com https://api.stripe.com https://*.stripe.com;
    frame-src 'self' https://www.instagram.com https://checkout.stripe.com https://js.stripe.com;
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `;

  if (vercelEnv === 'development') {
    // Allow Vercel Live in development
    csp = csp.replace(/script-src/, `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.googleapis.com https://www.instagram.com https://platform.instagram.com https://js.stripe.com https://vercel.live;`);
    csp = csp.replace(/connect-src/, `connect-src 'self' https://*.supabase.co https://*.googleapis.com https://www.instagram.com https://api.stripe.com https://*.stripe.com https://vercel.live;`);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(
    'Content-Security-Policy',
    csp.replace(/\s{2,}/g, ' ').trim()
  );

  const response = new Response(null, {
    status: 200,
    headers: requestHeaders,
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
    * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)
  ',
  ],
};
