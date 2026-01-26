import { NextRequest, NextResponse } from "next/server";

// Get backend URL - remove /api suffix if present to avoid double /api/api/
const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "https://b-ahlamy.developteam.site/api";
  // If URL already ends with /api, use it as-is, otherwise add /api
  return url.endsWith("/api") ? url : `${url}/api`;
};

const API_BASE_URL = getBackendUrl();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, role } = body;

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Forward cookies from the incoming request if any
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password, fullName, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // Create response
    const nextResponse = NextResponse.json(data);

    // Extract all Set-Cookie headers from backend response
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    
    // Log for debugging (server-side only)
    console.log(`[API Auth Register] Backend returned ${setCookieHeaders.length} cookies`);

    let token = null;

    // Find the auth_token cookie
    for (const cookieHeader of setCookieHeaders) {
      if (cookieHeader.includes("auth_token=")) {
        const match = cookieHeader.match(/auth_token=([^;]+)/);
        if (match && match[1]) {
          token = match[1];
          break;
        }
      }
    }

    // Fallback: search in single set-cookie header
    if (!token) {
      const singleSetCookie = response.headers.get("set-cookie");
      if (singleSetCookie) {
        const match = singleSetCookie.match(/auth_token=([^;,\s]+)/);
        if (match && match[1]) {
          token = match[1];
        }
      }
    }

    if (token) {
      console.log("[API Auth Register] Setting auth_token cookie on client");
      
      // Determine if we should use secure flag
      // Only use secure if in production AND not on localhost
      const isProduction = process.env.NODE_ENV === "production";
      const isLocalhost = request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
      const useSecure = isProduction && !isLocalhost;

      nextResponse.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: false,
        secure: useSecure,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    } else {
      console.warn("[API Auth Register] No auth_token found in backend response");
    }

    return nextResponse;
  } catch (error) {
    console.error("[API Auth Register] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

