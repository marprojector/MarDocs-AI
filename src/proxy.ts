import { auth } from '@/lib/auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isOnLogin = nextUrl.pathname.startsWith('/login');

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl)
    );
  }

  if (isOnLogin && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }

  return null;
});

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
