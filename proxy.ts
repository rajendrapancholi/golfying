import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Unified Protected Route Check
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname === "/admin-dashboard";

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role & Subscription Checks (Only if logged in)
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, subscription_status")
      .eq("id", user.id)
      .single();

    // Admin Protection: Only 'admin' role can enter /admin
    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (profile?.role === "admin" && pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    }
    // Subscriber Feature Locking
    // Ensure "Free" users can't access score entry or draws
    const restrictedPaths = ["/dashboard/scores", "/dashboard/draws"];
    const isRestricted = restrictedPaths.some((p) => pathname.startsWith(p));

    if (isRestricted && profile?.subscription_status !== "active") {
      // Redirect to subscription page with a trigger for the PlanPicker
      return NextResponse.redirect(
        new URL("/subscribe?reason=upgrade", request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
