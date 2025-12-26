/**
 * Moloni API Credentials Verification Script
 * Run this to test your Moloni API credentials
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.MOLONI_CLIENT_ID;
    const clientSecret = process.env.MOLONI_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'MOLONI_CLIENT_ID or MOLONI_CLIENT_SECRET not configured',
        },
        { status: 400 }
      );
    }

    // Test basic API connectivity (this doesn't require authentication)
    const response = await fetch('https://api.moloni.pt/v1/companies/getAll/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: 'test', // This will fail but test connectivity
      }),
    });

    // If we get a response (even an error), the API is reachable
    const isReachable = response.status > 0;

    return NextResponse.json({
      success: true,
      message: 'Moloni API credentials configured',
      details: {
        clientIdConfigured: !!clientId,
        clientSecretConfigured: !!clientSecret,
        apiReachable: isReachable,
        apiResponseStatus: response.status,
        nextStep: 'Test OAuth flow by connecting in settings',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to Moloni API',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
