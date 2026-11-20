// Konfigurasi Auth.js yang aman dijalankan di Edge (dipakai middleware).
// Jangan impor mongoose/bcrypt di sini.
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      if (path.startsWith("/api/auth")) return true;

      if (path === "/login") {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (path.startsWith("/api/")) {
        return isLoggedIn
          ? true
          : Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      return isLoggedIn; // false -> redirect otomatis ke /login
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
