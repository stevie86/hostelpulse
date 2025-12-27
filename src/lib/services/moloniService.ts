/**
 * Moloni API Service - Portuguese Invoicing Integration
 * Improved implementation with error handling and TypeScript types
 */

export interface InvoiceLine {
  name: string;
  qty: number;
  price: number; // Einzelpreis (Netto)
  taxId: string; // ID der Steuer in Moloni
  exemptionReason?: string; // Pflicht bei 0% Steuer
}

export interface MoloniConfig {
  clientId: string;
  clientSecret: string;
  username?: string;
  password?: string;
  companyId: string;
  sandbox?: boolean;
}

export interface MoloniInvoiceResponse {
  success: boolean;
  document_id?: string;
  document_number?: string;
  url?: string;
  url_pdf?: string;
  errors?: any;
}

export interface MoloniCustomer {
  customer_id?: number;
  name: string;
  nif?: string; // Portuguese tax number
  email?: string;
  address?: string;
}

export class MoloniService {
  private config: MoloniConfig;
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      clientId: process.env.MOLONI_CLIENT_ID || '',
      clientSecret: process.env.MOLONI_CLIENT_SECRET || '',
      username: process.env.MOLONI_USERNAME || '',
      password: process.env.MOLONI_PASSWORD || '',
      companyId: process.env.MOLONI_COMPANY_ID || '',
      sandbox: process.env.MOLONI_SANDBOX === 'true',
    };

    // Choose sandbox or production URL
    this.baseUrl = this.config.sandbox
      ? 'https://api.moloni.pt/v1'
      : 'https://api.moloni.pt/v1';

    this.validateConfig();
  }

  private validateConfig() {
    const required = ['clientId', 'clientSecret', 'companyId'];
    const missing = required.filter(
      (key) => !this.config[key as keyof MoloniConfig]
    );

    if (missing.length > 0) {
      console.error(
        `❌ CRITICAL: Missing Moloni config: ${missing.join(', ')}`
      );
      console.error('💡 Please set these environment variables in .env.local:');
      missing.forEach((key) => {
        const envVar = `MOLONI_${key.toUpperCase()}`;
        console.error(`   ${envVar}=your_value`);
      });
      throw new Error(`Missing Moloni configuration: ${missing.join(', ')}`);
    }

    console.log('✅ Moloni service initialized with config:', {
      hasCredentials: !!(this.config.clientId && this.config.clientSecret),
      companyId: this.config.companyId,
      sandbox: this.config.sandbox,
    });
  }

  /**
   * 1. Authentication - Get access token
   * Uses OAuth2 password grant flow
   */
  private async getToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    console.log('🔐 Getting Moloni access token...');

    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      username: this.config.username || this.config.clientId, // Fallback to client_id
      password: this.config.password || this.config.clientSecret, // Fallback to client_secret
    });

    try {
      const response = await fetch(`${this.baseUrl}/grant/?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Auth failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error(`No access token in response: ${JSON.stringify(data)}`);
      }

      // Cache token for 1 hour (3600 seconds)
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;

      console.log('✅ Moloni access token obtained successfully');
      return this.token;
    } catch (error) {
      console.error('❌ Moloni authentication failed:', error);
      console.error('💡 Check your credentials in .env.local');
      throw new Error(
        `Moloni authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 2. Find or create customer by NIF
   */
  private async findOrCreateCustomer(
    nif: string,
    customerData: Omit<MoloniCustomer, 'customer_id'>
  ): Promise<number> {
    const token = await this.getToken();

    console.log(`🔍 Looking for customer with NIF: ${nif}`);

    // First try to find existing customer
    try {
      const searchResponse = await fetch(
        `${this.baseUrl}/customers/getOne/?access_token=${token}&nif=${encodeURIComponent(nif)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (searchResponse.ok) {
        const customer = await searchResponse.json();
        if (customer.customer_id) {
          console.log(`✅ Found existing customer: ${customer.customer_id}`);
          return customer.customer_id;
        }
      }
    } catch (error) {
      console.warn('⚠️ Customer search failed, will create new:', error);
    }

    // Create new customer if not found
    console.log('➕ Creating new customer...');

    const createPayload = {
      company_id: this.config.companyId,
      name: customerData.name,
      nif: nif,
      email: customerData.email,
      address: customerData.address,
      vat_number: nif,
      contact_name: customerData.name,
      language_id: 1, // Portuguese
      country_id: 1, // Portugal
    };

    const createResponse = await fetch(
      `${this.baseUrl}/customers/insert/?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      throw new Error(
        `Customer creation failed: ${createResponse.status} - ${errorData}`
      );
    }

    const result = await createResponse.json();
    if (!result.customer_id) {
      throw new Error(`No customer_id in response: ${JSON.stringify(result)}`);
    }

    console.log(`✅ Customer created with ID: ${result.customer_id}`);
    return result.customer_id;
  }

  /**
   * 3. Create invoice with proper Portuguese requirements
   */
  async createInvoice(
    customerNif: string,
    customerData?: Omit<MoloniCustomer, 'customer_id'>,
    lines: InvoiceLine[],
    options?: {
      series?: string; // Invoice series (FR, FS, etc.)
      notes?: string;
      exemptionReason?: string;
    }
  ): Promise<MoloniInvoiceResponse> {
    console.log('📄 Creating Moloni invoice...');

    try {
      const token = await this.getToken();

      // Find or create customer
      let customerId: number;
      if (customerData) {
        customerId = await this.findOrCreateCustomer(customerNif, customerData);
      } else {
        customerId = 1; // Default "Consumidor Final" customer
      }

      // Prepare products for API format
      const products = lines.map((line) => ({
        product_id: 0, // 0 = Ad-hoc product (not in inventory)
        name: line.name,
        qty: line.qty,
        price: line.price,
        taxes: [
          {
            tax_id: line.taxId,
            value: line.price * line.qty, // Tax base amount
            exemption_reason: line.exemptionReason || options?.exemptionReason,
          },
        ],
        discount: 0,
        final_price: line.price * line.qty,
      }));

      const payload = {
        company_id: this.config.companyId,
        date: new Date().toISOString(),
        expiration_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days
        document_set_id: options?.series || 'FR', // Default to "Fatura" series
        customer_id: customerId,
        products: products,
        notes: options?.notes || '',
        status: 0, // 0 = Draft - safer start
        related_documents_notes: 'Gerado via HostelPulse',
        json: true,
      };

      console.log('📤 Sending invoice payload:', {
        customerCount: customerId,
        productCount: products.length,
        totalAmount: products.reduce((sum, p) => sum + p.final_price, 0),
      });

      const endpoint = `${this.baseUrl}/documents/insert/?access_token=${encodeURIComponent(token)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Moloni API Error Response:', errorText);
        throw new Error(
          `Invoice creation failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();

      if (!result.valid) {
        console.error('❌ Moloni API Validation Error:', result);
        throw new Error(
          `Invoice validation failed: ${JSON.stringify(result.errors || result)}`
        );
      }

      console.log('✅ Invoice created successfully:', {
        documentId: result.document_id,
        documentNumber: result.document_number,
        url: result.url,
      });

      return {
        success: true,
        document_id: result.document_id?.toString() || '',
        document_number: result.document_number,
        url: result.url,
        url_pdf: result.url_pdf,
      };
    } catch (error) {
      console.error('❌ Invoice creation failed:', error);
      return {
        success: false,
        errors: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 4. Get invoice details
   */
  async getInvoice(documentId: string): Promise<any> {
    const token = await this.getToken();

    const response = await fetch(
      `${this.baseUrl}/documents/getOne/?access_token=${encodeURIComponent(token)}&document_id=${documentId}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get invoice: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * 5. Send invoice by email
   */
  async sendInvoiceByEmail(
    documentId: string,
    email: string
  ): Promise<boolean> {
    const token = await this.getToken();

    const payload = {
      company_id: this.config.companyId,
      document_id: documentId,
      send_email: true,
      email: email,
      message: 'Fatura da sua estadia no HostelPulse',
    };

    const response = await fetch(
      `${this.baseUrl}/documents/sendByEmail/?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to send invoice: ${response.status} - ${errorText}`
      );
      return false;
    }

    console.log(`✅ Invoice ${documentId} sent to ${email}`);
    return true;
  }

  /**
   * 6. Test connection and credentials
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.getToken();
      return {
        success: true,
        message: 'Moloni API connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }
}

// Export singleton instance
export const moloniService = new MoloniService();
