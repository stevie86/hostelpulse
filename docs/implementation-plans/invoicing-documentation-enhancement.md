# Spec-Kitty: Comprehensive Invoicing & Documentation Enhancement

## Overview

**Goal**: Implement professional invoicing system with Moloni integration, Redis-powered queue system, automated email delivery, and comprehensive project documentation for seamless development continuation.

**Priority**: Invoicing via Moloni > Tax calculation > Documentation > Redis queue

## Research Findings

### Current Documentation Gaps

- **API Documentation**: Missing comprehensive endpoint documentation
- **Architecture Decisions**: No ADRs (Architecture Decision Records)
- **Setup Instructions**: Incomplete for new developers
- **Database Schema**: No migration documentation
- **Deployment Guide**: Missing for multiple environments

### Moloni API Analysis

- **Pricing**: €3.50/month starter + add-ons
- **Capabilities**: Full Portuguese invoicing, SAF-T export, VAT calculation
- **Integration**: REST API with comprehensive endpoints
- **Compliance**: AT-certified for Portuguese tax requirements

### Redis Queue Requirements

- **Use Case**: Async invoice processing and email delivery
- **Alternatives**: BullMQ, Bee Queue, Agenda.js
- **Benefits**: Reliability, scalability, retry logic

## Implementation Plan

### Phase 1: Documentation Foundation (1-2 weeks)

**Goal**: Create comprehensive documentation for seamless development continuation

#### 1.1 Project Documentation Structure

```
docs/
├── README.md                    # Comprehensive project overview
├── API_REFERENCE.md            # Complete API documentation
├── ARCHITECTURE.md             # System architecture & decisions
├── DATABASE_SCHEMA.md          # Schema documentation with diagrams
├── DEVELOPMENT_SETUP.md        # Local development environment
├── DEPLOYMENT_GUIDE.md         # Multi-environment deployment
├── COMPLIANCE_GUIDE.md         # Portuguese regulatory requirements
└── adr/                        # Architecture Decision Records
    ├── 001-moloni-invoicing.md
    ├── 002-redis-queue.md
    └── 003-guest-data-model.md
```

#### 1.2 API Documentation Automation

- **OpenAPI/Swagger**: Generate from TypeScript types
- **Endpoint Documentation**: Request/response examples
- **Error Handling**: Standardized error responses
- **Authentication**: API key and OAuth documentation

### Phase 2: Moloni Invoicing Integration (2-3 weeks)

**Goal**: Professional Portuguese invoicing with certified compliance

#### 2.1 Moloni API Integration

```typescript
// Core Moloni client
interface MoloniConfig {
  apiKey: string;
  companyId: string;
  sandbox: boolean;
}

class MoloniService {
  async createInvoice(invoiceData: InvoiceRequest): Promise<InvoiceResult>;
  async getInvoice(invoiceId: string): Promise<InvoiceDetails>;
  async sendInvoiceByEmail(invoiceId: string, email: string): Promise<void>;
  async generateSAFT(): Promise<SAFFile>;
}
```

#### 2.2 Invoice Data Mapping

```typescript
interface InvoiceRequest {
  customer: {
    name: string;
    nif?: string; // Portuguese tax number
    email: string;
    address?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    vat: number; // Portuguese VAT rate (6%)
  }>;
  touristTax?: number; // Municipal tax amount
  serie: string; // Invoice series (FR, FS)
  notes?: string;
}
```

#### 2.3 Compliance Features

- **Sequential Numbering**: INV-YYYY-XXXX format
- **VAT Calculation**: 6% for accommodation services
- **Tourist Tax Integration**: Added as separate line item
- **SAF-T Export**: Monthly tax authority submissions

### Phase 3: Redis Queue System (1-2 weeks)

**Goal**: Reliable async processing for invoices and email delivery

#### 3.1 Queue Architecture

```typescript
interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  queues: {
    invoice: string;
    email: string;
    compliance: string;
  };
}

// Queue job types
interface InvoiceJob {
  bookingId: string;
  customerEmail: string;
  invoiceData: InvoiceRequest;
}

interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}
```

#### 3.2 Queue Implementation

- **BullMQ**: Redis-based queue for Node.js
- **Job Retry Logic**: Exponential backoff for failed jobs
- **Monitoring**: Queue health and performance metrics
- **Error Handling**: Dead letter queues for permanent failures

### Phase 4: Automated Email Delivery (1 week)

**Goal**: Professional invoice delivery to guests

#### 4.1 Email Service Integration

```typescript
interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses';
  apiKey: string;
  fromEmail: string;
  templates: {
    invoice: string;
    bookingConfirmation: string;
  };
}

class EmailService {
  async sendInvoice(invoice: Invoice, guest: Guest): Promise<void>;
  async sendBookingConfirmation(booking: Booking): Promise<void>;
}
```

#### 4.2 Email Templates

- **Invoice Template**: Professional layout with payment instructions
- **Multi-language**: Portuguese + English support
- **PDF Attachment**: Invoice PDF automatically attached
- **Branding**: Customizable hostel branding

### Phase 5: Tax Calculation Integration (1 week)

**Goal**: Automated tourist tax calculation (secondary priority)

#### 5.1 Tax Rule Engine

```typescript
interface TaxRules {
  countryCode: string;
  municipalities: Record<string, MunicipalityTax>;
}

interface MunicipalityTax {
  ratePerNight: number;
  maxNights: number;
  exemptions: string[];
}

class TaxCalculator {
  calculateTouristTax(booking: Booking, municipality: string): TaxResult;
  validateExemptions(guest: Guest): ExemptionStatus;
}
```

## Technical Specifications

### Database Extensions

```sql
-- Invoice tracking
CREATE TABLE "Invoice" (
  "id" SERIAL PRIMARY KEY,
  "bookingId" INTEGER,
  "invoiceNumber" VARCHAR(50) UNIQUE,
  "moloniId" INTEGER,
  "status" VARCHAR(20) DEFAULT 'pending',
  "totalAmount" DECIMAL(10,2),
  "touristTax" DECIMAL(10,2) DEFAULT 0,
  "emailSent" BOOLEAN DEFAULT false,
  "emailSentAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Queue job tracking
CREATE TABLE "QueueJob" (
  "id" SERIAL PRIMARY KEY,
  "queueName" VARCHAR(50),
  "jobId" VARCHAR(100),
  "status" VARCHAR(20),
  "attempts" INTEGER DEFAULT 0,
  "data" JSONB,
  "error" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "completedAt" TIMESTAMP
);
```

### Environment Configuration

```env
# Moloni Integration
MOLONI_API_KEY=your_api_key
MOLONI_COMPANY_ID=your_company_id
MOLONI_SANDBOX=true

# Redis Queue
REDIS_URL=redis://localhost:6379
QUEUE_INVOICE=invoice-queue
QUEUE_EMAIL=email-queue

# Email Service
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_api_key
EMAIL_FROM=noreply@hostelpulse.com

# Tax Rules
TAX_RULES_PATH=./config/tax-rules.json
```

### API Endpoints

```
POST /api/invoices/generate     # Generate invoice for booking
GET  /api/invoices/:id          # Get invoice details
POST /api/invoices/:id/send     # Send invoice via email
GET  /api/invoices/saft         # Generate SAF-T file
GET  /api/queue/status          # Queue health monitoring
```

## Success Metrics

### Technical Metrics

- ✅ **100% Invoice Generation**: All bookings generate invoices automatically
- ✅ **99.9% Email Delivery**: Reliable invoice delivery to guests
- ✅ **<30s Queue Processing**: Fast async processing
- ✅ **100% SAF-T Compliance**: Valid tax authority submissions

### Business Metrics

- ✅ **Zero Manual Invoicing**: Fully automated process
- ✅ **Professional Delivery**: Branded emails with PDF attachments
- ✅ **Legal Compliance**: AT-certified invoicing
- ✅ **Guest Satisfaction**: 95%+ positive feedback on billing

## Dependencies & Prerequisites

### External Services

- **Moloni Account**: €3.50/month for invoicing
- **Redis Instance**: Cloud or self-hosted
- **Email Service**: SendGrid/Mailgun for delivery
- **SMTP Provider**: Fallback email delivery

### Development Dependencies

- **BullMQ**: Redis-based queue system
- **Nodemailer**: Email delivery
- **PDF-lib**: Invoice PDF generation
- **Redis**: Caching and queue storage

## Risk Assessment

### High Risk Items

1. **Moloni API Limits**: Rate limiting and quota management
2. **Email Deliverability**: Spam filters and bounce handling
3. **Redis Reliability**: Queue persistence and failover
4. **SAF-T Complexity**: Monthly export validation

### Mitigation Strategies

1. **Rate Limiting**: Implement request queuing and retry logic
2. **Email Monitoring**: Bounce tracking and unsubscribe handling
3. **Redis Clustering**: High availability Redis setup
4. **SAF-T Testing**: Sandbox environment validation

## Questions for Clarification

### Scope & Priorities

1. **Documentation Depth**: API reference only, or include video tutorials?
2. **Email Templates**: Basic HTML or advanced branding with logos?
3. **Queue Monitoring**: Basic logging or full dashboard/metrics?

### Technical Decisions

4. **Redis Hosting**: AWS ElastiCache, self-hosted, or Redis Cloud?
5. **Email Provider**: SendGrid reliability vs Mailgun cost?
6. **PDF Generation**: Server-side generation vs client-side templates?

### Business Requirements

7. **Invoice Frequency**: Generate on booking confirmation or check-in?
8. **Multi-language**: Portuguese only or include English for international guests?
9. **SAF-T Timing**: Real-time generation or monthly batch processing?

This specification provides a complete roadmap for professional invoicing infrastructure with comprehensive documentation for seamless development continuation.
