/**
 * Basic Moloni API Integration for Portuguese Invoicing
 * Simple implementation for MVP - can be upgraded to use @makinadios/moloni-client later
 *
 * Based on Moloni API documentation:
 * - Authentication: API key + secret
 * - Company ID required for operations
 * - REST API with JSON responses
 */

export interface MoloniConfig {
  apiKey: string;
  secret: string;
  companyId: string;
  sandbox?: boolean;
}

export interface MoloniInvoiceData {
  customer: {
    name: string;
    nif?: string; // Portuguese tax number
    email?: string;
    address?: string;
  };
  items: Array<{
    name: string;
    qty: number;
    price: number;
    taxes?: Array<{
      tax_id: number; // Moloni tax ID
      value: number; // Tax percentage
    }>;
  }>;
  serie: string; // Invoice series (FR, FS, etc.)
  notes?: string;
  touristTax?: number; // Custom field for tourist tax
}

export interface MoloniInvoiceResponse {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  pdfUrl?: string;
  error?: string;
}

class BasicMoloniClient {
  private config: MoloniConfig;
  private baseUrl: string;

  constructor(config: MoloniConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? 'https://api.sandbox.moloni.pt/v1'
      : 'https://api.moloni.pt/v1';
  }

  /**
   * Authenticate and get access token
   * Note: Moloni uses API key authentication, not OAuth tokens
   */
  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      // Moloni API key authentication
      Authorization: `Bearer ${this.config.apiKey}`,
      'Company-Id': this.config.companyId.toString(),
    };
  }

  /**
   * Create a new invoice
   */
  async createInvoice(
    invoiceData: MoloniInvoiceData
  ): Promise<MoloniInvoiceResponse> {
    try {
      // Prepare invoice data for Moloni API
      const moloniInvoice = {
        company_id: this.config.companyId,
        document_type_id: 1, // Invoice
        customer_id: await this.findOrCreateCustomer(invoiceData.customer),
        products: invoiceData.items.map((item) => ({
          product_id: null, // Use product name for now
          name: item.name,
          qty: item.qty,
          price: item.price,
          taxes: item.taxes || [
            {
              tax_id: 1, // Default Portuguese VAT
              value: 6.0, // 6% for accommodation
            },
          ],
        })),
        serie: invoiceData.serie,
        notes: invoiceData.notes || '',
        // Custom field for tourist tax (if supported)
        custom_fields: invoiceData.touristTax
          ? {
              tourist_tax: invoiceData.touristTax,
            }
          : undefined,
      };

      // Make API call to create invoice
      const response = await this.makeApiCall(
        '/documents/insert/',
        moloniInvoice
      );

      if (response.success) {
        return {
          success: true,
          invoiceId: response.document_id?.toString(),
          invoiceNumber: response.document_number,
          pdfUrl: response.pdf_url,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Unknown error',
        };
      }
    } catch (error) {
      console.error('Moloni API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API call failed',
      };
    }
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await this.makeApiCall('/documents/get/', {
        company_id: this.config.companyId,
        document_id: invoiceId,
      });
      return response;
    } catch (error) {
      console.error('Failed to get invoice:', error);
      throw error;
    }
  }

  /**
   * Send invoice via email
   */
  async sendInvoiceByEmail(invoiceId: string, email: string): Promise<boolean> {
    try {
      const response = await this.makeApiCall('/documents/sendEmail/', {
        company_id: this.config.companyId,
        document_id: invoiceId,
        email: email,
      });
      return response.success === true;
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      return false;
    }
  }

  /**
   * Find existing customer or create new one
   */
  private async findOrCreateCustomer(
    customerData: MoloniInvoiceData['customer']
  ): Promise<number> {
    try {
      // First try to find existing customer
      const searchResponse = await this.makeApiCall('/customers/getAll/', {
        company_id: this.config.companyId,
        q: customerData.nif || customerData.email || customerData.name,
      });

      if (searchResponse.success && searchResponse.length > 0) {
        return searchResponse[0].customer_id;
      }

      // Create new customer
      const createResponse = await this.makeApiCall('/customers/insert/', {
        company_id: this.config.companyId,
        name: customerData.name,
        nif: customerData.nif || '',
        email: customerData.email || '',
        address: customerData.address || '',
      });

      if (createResponse.success) {
        return createResponse.customer_id;
      }

      throw new Error('Failed to create customer');
    } catch (error) {
      console.error('Customer operation failed:', error);
      throw error;
    }
  }

  /**
   * Make API call to Moloni
   */
  private async makeApiCall(endpoint: string, data: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Moloni API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeApiCall('/companies/getAll/', {});
      return response.success === true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

// Factory function to create Moloni client
export function createMoloniClient(config: MoloniConfig): BasicMoloniClient {
  return new BasicMoloniClient(config);
}

// Example usage for testing
export const testMoloniIntegration = async () => {
  console.log('=== Moloni API Integration Test ===\n');

  // This would be configured from environment variables
  const config: MoloniConfig = {
    apiKey: process.env.MOLONI_API_KEY || 'test-key',
    secret: process.env.MOLONI_SECRET || 'test-secret',
    companyId: process.env.MOLONI_COMPANY_ID || '12345',
    sandbox: true,
  };

  const moloni = createMoloniClient(config);

  console.log('Testing API connection...');
  const connected = await moloni.testConnection();
  console.log('Connection status:', connected ? '✅ Connected' : '❌ Failed');

  if (!connected) {
    console.log(
      'Skipping invoice creation test - configure API credentials first'
    );
    return;
  }

  // Example invoice creation
  const invoiceData: MoloniInvoiceData = {
    customer: {
      name: 'João Silva',
      nif: '123456789',
      email: 'joao@example.com',
    },
    items: [
      {
        name: 'Accommodation - Private Room',
        qty: 3,
        price: 50.0,
        taxes: [{ tax_id: 1, value: 6.0 }], // 6% Portuguese VAT
      },
    ],
    serie: 'FR',
    notes: 'Tourist tax: €12.00 (3 nights × 1 guest × €4)',
    touristTax: 12.0,
  };

  console.log('\nCreating test invoice...');
  const result = await moloni.createInvoice(invoiceData);

  if (result.success) {
    console.log('✅ Invoice created successfully!');
    console.log('Invoice ID:', result.invoiceId);
    console.log('Invoice Number:', result.invoiceNumber);
    console.log('PDF URL:', result.pdfUrl);

    // Test email sending
    console.log('\nSending invoice via email...');
    const emailSent = await moloni.sendInvoiceByEmail(
      result.invoiceId!,
      'guest@example.com'
    );
    console.log('Email sent:', emailSent ? '✅ Success' : '❌ Failed');
  } else {
    console.log('❌ Invoice creation failed:', result.error);
  }
};
