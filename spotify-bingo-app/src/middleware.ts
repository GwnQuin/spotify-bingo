import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/inloggen",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/themas/:path*", "/kaarten/:path*", "/host/:path*"],
};
