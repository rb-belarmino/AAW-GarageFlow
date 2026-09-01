import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (NextAuth endpoints)
     * - login (Login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png and all static assets (.png, .svg, .jpg, .ico, etc.)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
