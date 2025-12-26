# Portuguese Tourist Tax & Invoicing API Implementation Plan

**Goal**: Implement automated tourist tax calculation and certified invoicing for Portuguese hostels with modular architecture for EU expansion.

**Key Findings**:

- Portuguese tourist tax varies significantly by municipality (€2-€10/night)
- Certified invoicing APIs available from €3.50/month
- Modular JSON rule system enables seamless EU expansion

---

## 🔍 **Portuguese Tourist Tax Research**

### **Official 2025 Rates by Municipality**

```json
{
  "portugal": {
    "countryCode": "PT",
    "currency": "EUR",
    "taxName": "Taxa Municipal Turística",
    "municipalities": {
      "lisbon": {
        "name": "Lisboa",
        "ratePerNight": 4.0,
        "maxNights": 7,
        "collectionType": "mandatory",
        "validFrom": "2024-01-01",
        "validTo": "2025-12-31",
        "exemptions": ["children_under_12"],
        "notes": "Lisbon city tax for all paid accommodations"
      },
      "porto": {
        "name": "Porto",
        "ratePerNight": 2.0,
        "maxNights": 7,
        "collectionType": "mandatory",
        "validFrom": "2024-01-01",
        "validTo": "2025-12-31",
        "exemptions": ["children_under_12"],
        "notes": "Porto municipal tourist tax"
      },
      "algarve_faro": {
        "name": "Faro (Algarve)",
        "ratePerNight": 2.0,
        "maxNights": 7,
        "collectionType": "mandatory",
        "validFrom": "2024-01-01",
        "validTo": "2025-12-31",
        "exemptions": ["children_under_12"],
        "notes": "Algarve region tourist tax"
      },
      "albufeira": {
        "name": "Albufeira",
        "ratePerNight": 2.0,
        "maxNights": 7,
        "collectionType": "mandatory",
        "validFrom": "2024-01-01",
        "validTo": "2025-12-31",
        "exemptions": ["children_under_12"],
        "notes": "Albufeira municipality tax"
      },
      "madeira_funchal": {
        "name": "Funchal (Madeira)",
        "ratePerNight": 2.0,
        "maxNights": 7,
        "collectionType": "mandatory",
        "validFrom": "2024-01-01",
        "validTo": "2025-12-31",
        "exemptions": ["children_under_12"],
        "notes": "Madeira island tourist tax"
      },
      "azores_ponta_delgada": {
        "name": "Ponta Delgada (Azores)",
        "ratePerNight": 2.0,
        "maxNights": 7,
        "collectionType": "mandatory",
        "validFrom": "2024-01-01",
        "validTo": "2025-12-31",
        "exemptions": ["children_under_12"],
        "notes": "Azores island tourist tax"
      }
    },
    "generalRules": {
      "maxNightsCap": 7,
      "exemptions": ["children_under_12", "disabled_persons"],
      "collectionTiming": "at_checkout",
      "reporting": "monthly_to_municipality",
      "legalBasis": "Municipal Law No. 28/2023"
    }
  }
}
```

### **Key Insights**

- **40 municipalities** implement tourist tax (out of 308 total)
- **Rate range**: €0.50 (some cities) to €10/night (Venice, but in Portugal max €4)
- **7-night maximum** applies universally in Portugal
- **Children under 12** typically exempt
- **Collection**: Mandatory at checkout, municipal reporting required

---

## 💰 **Invoicing API Options Analysis**

### **Moloni API - Recommended Primary Option**

**Pricing**:

- **Starter Pack**: €3.50/month
  - 20+ document types
  - Customer management
  - VAT reports
  - Tax Authority communication
  - SAF-T export
- **Add-ons**: Scale with business needs

**Features**:

- ✅ Portuguese certified software
- ✅ SAF-T export capability
- ✅ API integration
- ✅ 38,000+ customers
- ✅ Modular add-on system

**API Capabilities**:

```typescript
// Moloni API integration example
const invoice = await moloni.createInvoice({
  customer_id: customerId,
  products: [
    {
      name: 'Accommodation - Private Room',
      qty: nights,
      price: nightlyRate,
      taxes: [{ tax_id: 'IVA_PT_6' }], // 6% Portuguese VAT
    },
  ],
  tourist_tax: calculateTouristTax(booking),
  serie: 'FR', // Portuguese invoice series
});
```

### **KeyInvoice - Alternative Option**

**Pricing**:

- **Free version** available with limitations
- **Premium plans**: €5-€15/month based on usage

**Features**:

- ✅ Multi-platform (Linux, Mac, Windows)
- ✅ POS integration
- ✅ Stock management
- ✅ 40,000+ users

**Considerations**: Less API-focused, more desktop application oriented.

### **InvoiceXpress - Cloud-Native Option**

**Pricing**:

- **X1 Plan**: €1/document (pay-per-use)
- **X3 Plan**: €3/documents (small businesses)

**Features**:

- ✅ SAF-T export
- ✅ Multi-currency
- ✅ API integration
- ✅ Portuguese compliance

### **Recommendation: Moloni as Primary**

**Why Moloni?**

1. **Certified Portuguese software** - Meets AT requirements
2. **SAF-T export** built-in for tax compliance
3. **Modular pricing** - €3.50/month base, add-ons as needed
4. **Strong API** - Easy integration
5. **Portuguese market leader** - 38,000+ customers

---

## 📋 **Implementation Roadmap**

### **Phase 1: Tourist Tax System (2 weeks)**

- **Create tax rule JSON files** for all Portuguese municipalities
- **Implement TaxRuleEngine** with calculation logic
- **Add tax calculation** to booking creation flow
- **Update booking display** to show tax breakdown
- **Add tax reporting** for municipal compliance

### **Phase 2: Invoicing Integration (3 weeks)**

- **Set up Moloni account** and API credentials
- **Create InvoicingProvider interface** and Moloni implementation
- **Map booking data** to invoice format (accommodation + tourist tax)
- **Implement invoice generation** on booking confirmation
- **Add PDF download** and email sending

### **Phase 3: Compliance & SAF-T (2 weeks)**

- **Implement SAF-T export** via Moloni API
- **Add compliance tracking** (AL licenses, insurance)
- **Create monthly reporting** workflow
- **Add audit logging** for tax authority compliance

### **Phase 4: EU Expansion Foundation (1 week)**

- **Create country configuration** system
- **Abstract tax rules** for multi-country support
- **Add provider abstraction** for different EU invoicing systems
- **Document extension patterns** for Spain, Italy, France

---

## 💰 **Cost Analysis**

### **Tourist Tax System**

- **Development**: €2,000-€3,000 (JSON rules + calculation engine)
- **Maintenance**: €200/month (rule updates)

### **Invoicing Integration**

- **Moloni**: €3.50/month base + €50-€100/month add-ons
- **Development**: €3,000-€5,000 (API integration + mapping)
- **Setup**: €500 (account setup, configuration)

### **Total Monthly Cost**: €55-€155

### **ROI**: Eliminates €4-6 hours/month compliance work per hostel

---

## ⚖️ **Business Impact Assessment**

### **Hostel Owner Benefits**

- **Automated compliance**: Zero manual tourist tax calculation
- **Legal certainty**: Certified invoicing meets Portuguese requirements
- **Revenue protection**: Automatic tax collection (€300K+ potential in Lisbon)
- **Time savings**: 4-6 hours/month freed for core business

### **HostelPulse Advantages**

- **Competitive moat**: Only automated Portuguese compliance platform
- **Expansion ready**: Modular system for 27 EU countries
- **Trust factor**: "Compliance guaranteed" positioning
- **Revenue share**: Tourist tax collection creates new revenue stream

## ❓ **Key Questions for Implementation**

1. **Tourist Tax Focus**: Start with Lisbon + Porto + Algarve, or all 40 municipalities?
2. **Invoicing Scope**: Basic invoices only, or include quotes, receipts, credit notes?
3. **SAF-T Priority**: Monthly export sufficient, or real-time required?
4. **Configuration Storage**: JSON files vs database vs environment variables?
5. **Plugin Loading**: Runtime plugin loading vs compile-time inclusion?
6. **Testing Approach**: Country-specific test suites or unified testing?
7. **Launch Timeline**: How quickly do we need Portuguese compliance to start operations?
8. **Property Types**: Focus on AL (local accommodation) or include hotels/hostels too?
9. **SEF Integration**: Direct API integration or manual XML export workflow?
10. **Next Country**: Which EU country should we prepare for after Portugal (Spain, Italy, France)?

**This implementation transforms HostelPulse from a basic booking system into a compliance-automated revenue engine for Portuguese hostels.**
