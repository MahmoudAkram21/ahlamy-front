import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export async function GET(request: NextRequest) {
  try {
    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Forward cookies from the incoming request
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    // Forward Authorization header if present
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Auth Me] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
