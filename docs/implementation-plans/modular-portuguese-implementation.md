# Modular Portuguese Implementation Plan - EU-Ready Architecture

**Perfect approach** - we'll implement Portuguese compliance with a **modular architecture** that enables seamless EU expansion. This gives us the Portuguese market quickly while building a scalable foundation.

## 🎯 **Implementation Strategy**

### **Modular Configuration Framework**

```typescript
interface ComplianceConfig {
  country: {
    code: 'PT'; // ISO country code
    name: 'Portugal';
    currency: 'EUR';
    language: 'pt-PT';
  };

  tax: {
    vat: {
      accommodationRate: 0.06; // 6%
      standardRate: 0.23; // 23%
      reducedRates: {
        food: 0.06;
        books: 0.06;
      };
    };
    touristTax: {
      enabled: true;
      ratePerNight: 4.0; // €4/night Lisbon
      maxNights: 7; // 7 night cap
      collectionType: 'municipal';
      municipalOverrides: {
        Lisbon: { rate: 4.0 };
        Porto: { rate: 2.0 };
        Algarve: { rate: 2.0 };
      };
    };
  };

  guestRegistration: {
    required: true;
    system: 'SIBA';
    authority: 'SEF';
    deadlineDays: 3; // 3 working days
    requiredFields: [
      'firstName',
      'lastName',
      'nationality',
      'dateOfBirth',
      'documentType',
      'documentNumber',
      'documentIssuingCountry',
    ];
  };

  invoicing: {
    standard: 'SAF-T';
    certificationRequired: true;
    encryption: {
      algorithm: 'AES-128-CTR';
      keySource: 'AT-generated'; // Portuguese Tax Authority
      xmlCanonicalization: true;
    };
    sequentialNumbering: true;
    vatIncluded: true;
  };

  compliance: {
    licenseTypes: ['AL', 'insurance', 'fire_safety'];
    reportingFrequency: 'monthly';
    auditRequirements: {
      safTFiles: true;
      modelo30: false; // Not required for small businesses
    };
  };
}
```

## 📋 **Implementation Roadmap**

### **Phase 1: Core Portuguese Features (4-6 weeks)**

#### **1.1 Tourist Tax System**

- Modular tax calculation engine
- Municipal rate overrides (Lisbon €4, Porto €2)
- 7-night maximum cap enforcement
- Invoice line item integration

#### **1.2 VAT Invoicing (6%)**

- Portuguese VAT calculation (6% accommodation)
- Sequential invoice numbering (INV-YYYY-XXXX)
- Customer NIF collection
- PDF generation with Portuguese legal requirements

#### **1.3 SIBA Guest Registration**

- SEF-compliant guest data collection
- XML export generation for SIBA platform
- Reporting status tracking
- 3-day deadline monitoring

#### **1.4 SAF-T File Generation**

- Portuguese XML schema compliance
- AES-128-CTR encryption implementation
- Monthly export capability
- Tax authority submission workflow

### **Phase 2: Compliance & Security (2-3 weeks)**

#### **2.1 AL License Tracking**

- Document upload and expiry monitoring
- Renewal reminder system
- Compliance status dashboard
- Regulatory requirement tracking

#### **2.2 GDPR Integration**

- Portuguese-specific privacy notice
- Consent management for marketing
- Data retention policies (7-10 years for tax)
- Data subject rights implementation

#### **2.3 Security Enhancements**

- Data encryption for sensitive guest data
- Audit logging for compliance tracking
- Secure API communication with SEF
- Backup and recovery procedures

## 🏗️ **Modular Architecture Design**

### **Configuration Management System**

```typescript
class ComplianceManager {
  private countryConfigs = new Map<string, CountryConfig>();

  registerCountry(config: CountryConfig) {
    this.countryConfigs.set(config.country.code, config);
  }

  getCountryConfig(countryCode: string): CountryConfig {
    return (
      this.countryConfigs.get(countryCode) || this.countryConfigs.get('PT')
    );
  }
}

// Usage
const complianceManager = new ComplianceManager();
complianceManager.registerCountry(portugalConfig);
complianceManager.registerCountry(spainConfig); // Future expansion
```

### **Plugin Architecture**

```typescript
interface CompliancePlugin {
  countryCode: string;
  calculateTax(params: TaxCalculationParams): TaxResult;
  generateInvoice(params: InvoiceParams): Invoice;
  createRegistrationExport(params: GuestExportParams): XMLDocument;
  validateCompliance(propertyData: PropertyData): ComplianceStatus;
}

// Plugin implementations
class PortugalCompliancePlugin implements CompliancePlugin {
  countryCode = 'PT';

  calculateTax(params: TaxCalculationParams): TaxResult {
    // Portuguese tourist tax logic (€4/night, max 7)
    const taxableNights = Math.min(params.nights, 7);
    const taxAmount = taxableNights * params.guests * 4.0;
    return { amount: taxAmount, currency: 'EUR' };
  }

  generateInvoice(params: InvoiceParams): Invoice {
    // Portuguese VAT and SAF-T compliant invoice
    return {
      number: `INV-${new Date().getFullYear()}-${params.sequence}`,
      vatRate: 0.06,
      touristTax: this.calculateTax(params).amount,
      // ... Portuguese-specific fields
    };
  }
}
```

### **Database Schema (Modular)**

```sql
-- Core tables (country-agnostic)
CREATE TABLE "ComplianceConfig" (
  "countryCode" VARCHAR(2) PRIMARY KEY,
  "config" JSONB,  -- Flexible configuration storage
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Country-specific extensions
CREATE TABLE "Guest_PT" (  -- Portuguese guest extensions
  "guestId" INTEGER PRIMARY KEY,
  "nif" VARCHAR(20),  -- Portuguese tax number
  "sibaReported" BOOLEAN DEFAULT false,
  "sibaReportedAt" TIMESTAMP
);

-- Unified invoice table with country-specific fields
CREATE TABLE "Invoice" (
  "id" SERIAL PRIMARY KEY,
  "countryCode" VARCHAR(2) NOT NULL,
  "invoiceNumber" VARCHAR(50) UNIQUE,
  "taxDetails" JSONB, -- Country-specific tax information
  "complianceData" JSONB, -- SAF-T, FacturaE, etc.
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## ❓ **Clarifying Questions**

### **Priority & Scope**

1. **Core Features**: Which Portuguese features are most critical for MVP launch?
   - Tourist tax collection (revenue generator)
   - SIBA guest registration (legal requirement)
   - VAT invoicing (professional appearance)
   - SAF-T compliance (tax authority submission)

2. **GDPR Integration**: Should we include basic GDPR features in this phase or separate them?

### **Technical Decisions**

3. **Configuration Storage**: JSON files vs database vs environment variables?
4. **Plugin Loading**: Runtime plugin loading vs compile-time inclusion?
5. **Testing Approach**: Country-specific test suites or unified testing?

### **Business Considerations**

6. **Launch Timeline**: How quickly do we need Portuguese compliance to start operations?
7. **Property Types**: Focus on AL (local accommodation) or include hotels/hostels too?
8. **SEF Integration**: Direct API integration or manual XML export workflow?

**This modular approach gives us Portuguese market access within 6-8 weeks while building the foundation for EU dominance. Which aspects should we prioritize for the initial implementation?**
