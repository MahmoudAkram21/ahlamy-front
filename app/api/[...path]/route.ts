import { NextRequest, NextResponse } from "next/server";

// Get backend URL - remove /api suffix if present to avoid double /api/api/
const getBackendUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "https://b-ahlamy.developteam.site";
  // If URL already ends with /api, use it as-is, otherwise add /api
  return url.endsWith("/api") ? url : `${url}/api`;
};

const API_BASE_URL = getBackendUrl();

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const unwrappedParams = await params;
    const path = unwrappedParams.path.join("/");
    const url = `${API_BASE_URL}/${path}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    console.log(`[Proxy] ${request.method} ${fullUrl}`);

    // Prepare headers
    const headers = new Headers();
    
    // Forward essential headers
    const forwardHeaders = ["content-type", "authorization", "cookie"];
    for (const h of forwardHeaders) {
      const val = request.headers.get(h);
      if (val) headers.set(h, val);
    }

    // Set origin to backend domain to satisfy some CORS/security checks
    const targetUrl = new URL(API_BASE_URL);
    headers.set("Host", targetUrl.host);

    // Prepare body if it's not a GET/HEAD request
    let body: any = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await request.text();
      } else if (contentType.includes("multipart/form-data")) {
        // For multipart, we need to pass the raw blob
        body = await request.blob();
      } else {
        body = await request.text();
      }
    }

    // Call the backend API
    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body,
      credentials: "include",
    });

    // Extract content type
    const contentType = response.headers.get("content-type") || "text/plain";
    
    // Get response body as buffer to handle all types (JSON, binary, etc.)
    const buffer = await response.arrayBuffer();

    // Create response
    const nextResponse = new NextResponse(buffer, { 
      status: response.status,
      headers: {
        "Content-Type": contentType,
      }
    });

    // Forward Set-Cookie headers from backend if any
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    for (const cookieHeader of setCookieHeaders) {
      nextResponse.headers.append("Set-Cookie", cookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("[Proxy Error]:", error);
    return NextResponse.json(
      { error: "Internal server error in proxy" },
      { status: 500 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
