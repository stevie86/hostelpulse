import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window

function getClientIP(request: NextRequest): string {
  // Get IP from various headers (in production, trust proxy headers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  return forwarded?.split(',')[0] ||
         realIP ||
         clientIP ||
         request.ip ||
         'unknown';
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  clientData.count++;
  return true;
}

function validateRequest(request: NextRequest): { valid: boolean; error?: string } {
  // Check for suspicious patterns in headers
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';

  // Basic bot detection
  if (userAgent.length < 10 && !userAgent.includes('bot')) {
    return { valid: false, error: 'Invalid user agent' };
  }

  // Check for SQL injection patterns in query params
  const url = new URL(request.url);
  const queryString = url.search;

  const sqlInjectionPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
    /('|(\\x27)|(\\x2D\\x2D)|(\\#)|(\%27)|(\%23))/i,
    /(<script|javascript:|vbscript:|onload=|onerror=)/i
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(queryString) || pattern.test(referer)) {
      return { valid: false, error: 'Suspicious request pattern detected' };
    }
  }

  return { valid: true };
}

export function middleware(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Request validation
  const validation = validateRequest(request);
  if (!validation.valid) {
    console.warn(`Blocked suspicious request from ${clientIP}: ${validation.error}`);
    return new Response(
      JSON.stringify({ error: 'Bad request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Add security headers
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CORS headers (adjust origins for production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'https://yourdomain.com');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

// Only apply to API routes
export const config = {
  matcher: '/api/:path*',
};