# Guest Data Model Analysis: Significant Gaps Identified

**Our current guest data model is INCOMPLETE** for Portuguese compliance and professional operations. We're missing **critical fields** required for legal compliance, tourist tax calculation, and proper invoicing.

## ❌ **Missing Critical Fields**

### **SIBA/SEF Compliance (MANDATORY)**

**Current**: Basic document fields exist
**Missing**:

```sql
-- Required for SEF reporting within 3 days
placeOfBirth          TEXT,                    -- Birthplace for SEF
documentIssuingCountry VARCHAR(100),          -- Issuing country
documentExpiryDate    DATE,                   -- Expiry validation
sibaReported          BOOLEAN DEFAULT false,  -- Tracking status
sibaReportedAt        TIMESTAMP,              -- Report timestamp
sibaReportId          VARCHAR(50),            -- SEF reference number
```

### **Tourist Tax Exemptions**

**Current**: Only dateOfBirth (basic)
**Missing**:

```sql
-- Portuguese tourist tax exemptions
isChild               BOOLEAN GENERATED ALWAYS AS (dateOfBirth > DATE_SUB(NOW(), INTERVAL 12 YEAR)) STORED,
isDisabled            BOOLEAN DEFAULT false,   -- Disability exemption
disabilityProof       TEXT,                    -- Supporting documentation
exemptionReason       VARCHAR(100),            -- Exemption justification
exemptionVerified     BOOLEAN DEFAULT false,   -- Verification status
```

### **GDPR Compliance**

**Current**: No GDPR-specific fields
**Missing**:

```sql
-- GDPR mandatory fields
consentGiven          BOOLEAN DEFAULT false,   -- Marketing consent
consentDate           TIMESTAMP,               -- Consent timestamp
consentWithdrawalDate TIMESTAMP,               -- Withdrawal date
dataRetentionExpiry   DATE,                    -- Auto-deletion date
anonymized            BOOLEAN DEFAULT false,   -- Post-GDPR processing
gdprRequestCount      INT DEFAULT 0,           -- Subject access requests
lastGdprUpdate        TIMESTAMP,               -- Last data modification
```

### **Professional Invoicing**

**Current**: Basic name fields
**Missing**:

```sql
-- Portuguese tax authority requirements
taxId                 VARCHAR(20),             -- NIF (Portuguese tax number)
legalName             VARCHAR(200),            -- Company legal name
vatNumber             VARCHAR(20),             -- EU VAT number
billingAddress        TEXT,                    -- Separate billing address
billingEmail          VARCHAR(320),            -- Invoicing email
billingLanguage       VARCHAR(5) DEFAULT 'pt', -- Invoice language
invoicePreference     VARCHAR(20) DEFAULT 'email', -- Email/paper
```

### **Enhanced Guest Experience**

**Current**: Basic contact info
**Missing**:

```sql
-- Better guest management
emergencyContact      JSONB,                   -- Emergency contact details
medicalInfo           JSONB,                   -- Medical conditions/allergies
preferredRoom         VARCHAR(100),            -- Room preferences
specialRequests       TEXT,                    -- Accommodation requests
marketingOptIn        BOOLEAN DEFAULT false,   -- Marketing preferences
lastStayDate          DATE,                    -- For repeat guest recognition
totalStays            INT DEFAULT 0,           -- Loyalty tracking
```

## 📊 **Compliance Impact Assessment**

### **Legal Risk Level: CRITICAL**

- **SIBA/SEF**: Cannot legally operate without proper guest data tracking
- **Tourist Tax**: Missing exemption data leads to incorrect taxation
- **GDPR**: No consent tracking or data retention policies
- **Invoicing**: Incomplete customer data for professional invoices

### **Business Impact**

- **Revenue Loss**: Incorrect tourist tax collection (€4/night × errors)
- **Legal Fines**: €2,500-€40,000 for compliance violations
- **Customer Experience**: Poor invoicing and data management
- **Competitive Disadvantage**: Cannot offer professional compliance features

## 🏗️ **Required Data Model Extensions**

### **Updated Guest Model**

```sql
model Guest {
  // Existing fields...

  // SIBA/SEF Compliance (MANDATORY)
  placeOfBirth          String?
  documentIssuingCountry String?
  documentExpiryDate    DateTime?
  sibaReported          Boolean   @default(false)
  sibaReportedAt        DateTime?
  sibaReportId          String?

  // Tourist Tax
  isDisabled            Boolean   @default(false)
  disabilityProof       String?
  exemptionReason       String?
  exemptionVerified     Boolean   @default(false)

  // GDPR Compliance
  consentGiven          Boolean   @default(false)
  consentDate           DateTime?
  consentWithdrawalDate DateTime?
  dataRetentionExpiry   DateTime?
  anonymized            Boolean   @default(false)
  gdprRequestCount      Int       @default(0)

  // Professional Invoicing
  taxId                 String?
  legalName             String?
  vatNumber             String?
  billingAddress        String?
  billingEmail          String?
  billingLanguage       String    @default("pt")
  invoicePreference     String    @default("email")

  // Enhanced Experience
  emergencyContact      Json?
  medicalInfo           Json?
  preferredRoom         String?
  specialRequests       String?
  marketingOptIn        Boolean   @default(false)
  lastStayDate          DateTime?
  totalStays            Int       @default(0)

  // Indexes for performance
  @@index([taxId])
  @@index([sibaReported])
  @@index([dataRetentionExpiry])
}
```

## 📋 **Implementation Priority**

### **Phase 1: Critical Compliance (Immediate)**

1. **SIBA/SEF fields** - Legal requirement for operation
2. **Tourist tax exemptions** - Revenue accuracy
3. **Basic GDPR fields** - Consent and retention

### **Phase 2: Professional Operations**

4. **Invoicing fields** - Tax authority compliance
5. **Enhanced guest data** - Better customer experience

### **Phase 3: Advanced Features**

6. **GDPR automation** - Data lifecycle management
7. **Loyalty features** - Repeat guest optimization

## ❓ **Key Questions for Implementation**

### **Scope Decisions**

1. **GDPR Depth**: Basic consent tracking or full data subject rights portal?
2. **Emergency Data**: Store medical info or just emergency contacts?
3. **Tax Validation**: Real-time NIF validation or manual entry?

### **Technical Considerations**

4. **Data Encryption**: Which fields need encryption at rest?
5. **Migration Strategy**: How to handle existing guest data?
6. **API Impact**: Will new fields affect existing integrations?

### **Business Requirements**

7. **Guest Portal**: Self-service data updates for guests?
8. **Data Retention**: 7-year tax retention or configurable per guest?
9. **Marketing Consent**: Granular opt-ins or simple yes/no?

**The current guest model supports basic booking operations but is insufficient for legal compliance and professional hostel management. We need to add 15-20 additional fields for Portuguese regulatory requirements alone.**
