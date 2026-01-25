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

    // Check content type before parsing
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      // Try to parse as JSON, fallback to text if not JSON
      let error;
      if (isJson) {
        try {
          error = await response.json();
        } catch {
          error = { error: await response.text() };
        }
      } else {
        const text = await response.text();
        error = { error: text || `HTTP ${response.status}` };
      }
      return NextResponse.json(error, { status: response.status });
    }

    // Parse response
    let data;
    if (isJson) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("[API Auth Me] JSON parse error:", parseError);
        return NextResponse.json(
          { error: "Invalid JSON response from backend" },
          { status: 500 }
        );
      }
    } else {
      const text = await response.text();
      return NextResponse.json(
        { error: `Backend returned non-JSON: ${text.substring(0, 100)}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Auth Me] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
