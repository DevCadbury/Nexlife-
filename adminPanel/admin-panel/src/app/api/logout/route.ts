import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

    // Forward the request to the backend logout endpoint
    const response = await fetch(`${backendUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    // Get the response headers, especially Set-Cookie for clearing the JWT
    const responseHeaders = new Headers();

    // Copy Set-Cookie header if present
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie);
    }

    // Clear localStorage token (this will be handled by client-side script)
    responseHeaders.set('Set-Cookie', 'nxl_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

    // Redirect to login page after logout
    responseHeaders.set('location', '/login');

    return new NextResponse(null, {
      status: 302, // Redirect
      headers: responseHeaders,
    });
  } catch (error) {

    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
