import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_PREFIX = "/admin";
const CLIENT_PREFIX = "/dashboard";
const PUBLIC_PATHS = ["/login"];

// Route protection + role-based redirects. Runs on every request that matches
// the matcher below.
export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(CLIENT_PREFIX);

  // Not signed in → only public routes are allowed.
  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Signed in: resolve role to enforce the admin/client boundary.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "client";
  const home = role === "admin" ? ADMIN_PREFIX : CLIENT_PREFIX;

  // Signed-in users shouldn't sit on the login page — send them to their app.
  // The marketing pages ("/", "/pricing") stay accessible to everyone.
  if (PUBLIC_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  // Clients cannot enter /admin; admins cannot enter /dashboard.
  if (pathname.startsWith(ADMIN_PREFIX) && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = CLIENT_PREFIX;
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith(CLIENT_PREFIX) && role !== "client") {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_PREFIX;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimization files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
