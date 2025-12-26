# Feature Specification: Guest Check-In/Check-Out System

<!-- Replace [FEATURE NAME] with the confirmed friendly title generated during /spec-kitty.specify. -->

**Feature Branch**: `018-guest-check-in`  
**Created**: Fri Dec 26 2025  
**Status**: Draft  
**Input**: User description: "Build a guest check-in/check-out system with:
- Real-time guest registration and validation
- Room assignment with availability checking
- Automated billing integration
- Mobile-responsive booking forms
- Check-out with SEF reporting compliance
- Dashboard with occupancy statistics "

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Guest Check-In (Priority: P1)

Receptionist (volunteer or temporary staff) registers a new guest with real-time validation, assigns an available room, and processes automated billing, all within 60 seconds using a touch-first interface with big buttons and auto-calculated taxes to prevent compliance errors.

**Why this priority**: Core functionality for daily operations, ensuring speed and accuracy for untrained staff.

**Independent Test**: Can be fully tested by completing a guest check-in process and verifying room assignment and billing accuracy.

**Acceptance Scenarios**:

1. **Given** a receptionist is at the check-in station, **When** they enter guest details (name, ID, contact), **Then** the system validates the information in real-time and flags any invalid entries.
2. **Given** guest details are valid, **When** the receptionist selects a room type, **Then** the system shows only available rooms and assigns the selected room.
3. **Given** room is assigned, **When** check-in is confirmed, **Then** the system auto-calculates taxes, generates billing, and completes the check-in.

---

### User Story 2 - Guest Check-Out (Priority: P1)

Receptionist processes guest check-out, finalizes billing, and generates SEF-compliant reporting for legal auditability.

**Why this priority**: Critical for revenue capture and regulatory compliance.

**Independent Test**: Can be fully tested by completing a check-out process and verifying SEF report generation.

**Acceptance Scenarios**:

1. **Given** a guest is ready to check-out, **When** the receptionist initiates check-out, **Then** the system displays final billing with auto-calculated taxes.
2. **Given** billing is reviewed, **When** check-out is confirmed, **Then** the system generates and exports SEF-compliant report for tax authorities.
3. **Given** check-out is complete, **When** the manager reviews later, **Then** they can see the snapshot of tax calculations for audit purposes.

---

### User Story 3 - Occupancy Dashboard (Priority: P2)

Manager (owner) views real-time occupancy statistics and exports reports for business insights and compliance verification.

**Why this priority**: Provides visibility into operations and ensures trust through auditability, though not critical for immediate check-in/out flow.

**Independent Test**: Can be fully tested by accessing the dashboard and verifying occupancy data accuracy.

**Acceptance Scenarios**:

1. **Given** the manager logs in, **When** they view the dashboard, **Then** real-time occupancy stats are displayed.
2. **Given** occupancy data is shown, **When** they export reports, **Then** SAF-T files are generated for tax verification.

### Edge Cases

- What happens when no rooms are available for the requested type?
- How does system handle invalid guest data (e.g., fake ID, incomplete info)?
- What if billing calculation fails due to system error?
- How to handle check-out for guests with unpaid balances?
- What if SEF reporting export encounters connectivity issues?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST enable real-time guest registration with validation of personal details.
- **FR-002**: System MUST check room availability before allowing assignment.
- **FR-003**: System MUST integrate automated billing with auto-calculated taxes.
- **FR-004**: System MUST provide mobile-responsive forms for booking and check-in.
- **FR-005**: System MUST support check-out process with SEF reporting compliance.
- **FR-006**: System MUST display occupancy statistics on a dashboard.

### Key Entities _(include if feature involves data)_

- **Guest**: Represents the person checking in, with attributes like name, ID, contact, nationality for tax purposes.
- **Room**: Represents available accommodation, with attributes like type, capacity, availability status.
- **Booking**: Links guest to room for a stay period, including check-in/out dates.
- **Billing**: Records charges, taxes, and payments associated with the booking.
- **SEF Report**: Audit trail for tax compliance, capturing snapshots of calculations.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Receptionists complete guest check-in in under 60 seconds without manual tax calculations.
- **SC-002**: System achieves 100% accuracy in tax calculations and SEF reporting exports.
- **SC-003**: Managers access occupancy dashboard with real-time data updates within 5 seconds.
- **SC-004**: System handles check-in/out for up to 100 guests per day without errors.
- **SC-005**: 95% of receptionists report high ease of use on touch-first interface.