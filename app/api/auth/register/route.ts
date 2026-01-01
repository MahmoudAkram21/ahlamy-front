import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://b-ahlamy.developteam.site/api";

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
    
    // Find the auth_token cookie
    for (const cookieHeader of setCookieHeaders) {
      if (cookieHeader.includes("auth_token=")) {
        // Extract the token value from the cookie string
        const match = cookieHeader.match(/auth_token=([^;]+)/);
        if (match && match[1]) {
          const token = match[1];
          
          // Set the cookie on the frontend domain
          nextResponse.cookies.set({
            name: "auth_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
          });
          
          break;
        }
      }
    }

    // Also try to get from response headers directly (for older Node.js versions)
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader && !nextResponse.cookies.get("auth_token")) {
      const match = setCookieHeader.match(/auth_token=([^;,\s]+)/);
      if (match && match[1]) {
        nextResponse.cookies.set({
          name: "auth_token",
          value: match[1],
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
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

