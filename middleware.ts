import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define your public and ignored routes
const publicRoutes = [
  "/",
  "/api/webhook",
  "/question/:id",
  "/tags",
  "/tags/:id",
  "/profile/:id",
  "/community",
  "/jobs",
];
const ignoredRoutes = ["/api/webhook", "/api/chatgpt"];

const isProtectedRoute = createRouteMatcher(["/ask-question(.*)"]);

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl.pathname;

  // Check if the route is in ignoredRoutes
  if (ignoredRoutes.some((route) => url.startsWith(route))) {
    return; // Skip the middleware for ignored routes
  }

  // Check if the route is in publicRoutes
  if (publicRoutes.some((route) => url.startsWith(route))) {
    return; // Allow access to public routes without authentication
  }

  // Protect the route if it's a protected route
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
