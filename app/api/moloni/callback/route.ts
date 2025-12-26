import { NextRequest, NextResponse } from 'next/server';

/**
 * Moloni OAuth Callback Handler
 * Handles the OAuth callback from Moloni API after authorization
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Moloni OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`${baseUrl}/properties/settings?error=moloni_oauth_failed`)
    );
  }

  // Validate required parameters
  if (!code) {
    console.error('Moloni OAuth callback: Missing authorization code');
    return NextResponse.redirect(
      new URL(`${baseUrl}/properties/settings?error=moloni_missing_code`)
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code, baseUrl);

    if (tokenResponse.success) {
      console.log('✅ Moloni OAuth successful - tokens received');
      return NextResponse.redirect(
        new URL(`${baseUrl}/properties/settings?success=moloni_connected`)
      );
    } else {
      console.error('Moloni token exchange failed:', tokenResponse.error);
      return NextResponse.redirect(
        new URL(
          `${baseUrl}/properties/settings?error=moloni_token_exchange_failed`
        )
      );
    }
  } catch (error) {
    console.error('Moloni callback error:', error);
    return NextResponse.redirect(
      new URL(`${baseUrl}/properties/settings?error=moloni_callback_error`)
    );
  }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string, baseUrl: string) {
  try {
    const clientId = process.env.MOLONI_CLIENT_ID;
    const clientSecret = process.env.MOLONI_CLIENT_SECRET;
    const redirectUri =
      process.env.MOLONI_REDIRECT_URI || `${baseUrl}/api/moloni/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Moloni OAuth credentials not configured');
    }

    const response = await fetch('https://api.moloni.pt/v1/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Token exchange failed',
      };
    }

    // Log success (in production, store securely)
    console.log('Moloni tokens received:', {
      access_token: data.access_token ? '***' : 'missing',
      refresh_token: data.refresh_token ? '***' : 'missing',
      expires_in: data.expires_in,
    });

    return {
      success: true,
      tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
