# Technical Requirements Document (TRD)

**Project Name:** Phone Zone  

## Table of Contents

1. Rebranding, System Overview & Core Goals
2. End-User License Agreement (EULA) & Legal Safeguards
3. Database Architecture Revisions
4. UI Refinements & User Experience Safeguards
5. Professional Invoice Structure & A4 Print Layout
6. Tax Engine Core Rules

---

# 1. Rebranding, System Overview & Core Goals

The software has been renamed from **FoneHisab** to **Phone Zone**. All user-facing components, headers, desktop frames, installers, and system descriptors must reflect this branding.

## Core Goals

### Reliable Offline Operation
- Run strictly local without server dependencies.
- Write directly to an offline database file (`shop.db`) in the local user data directory.

### Professional Indian GST Compliance
- Track HSN codes.
- Compute standard GST and second-hand Margin Scheme taxes.
- Export formatted GSTR-1 spreadsheets.

### Hardware Registry Tracking
- Optional IMEI recording on device-level invoices.
- Ignore tracking for accessories and repair services.

---

# 2. End-User License Agreement (EULA) & Legal Safeguards

To insulate the software developer from legal liabilities, financial audits, or tax penalties resulting from user-input errors or software anomalies, the installer and first-run routine must contain a blocking License Agreement.

## Installation & First-Run Constraint

- **Installation/Launch Block:** The application must block access until the user checks an explicit agreement checkbox:

> "I unconditionally accept all terms and disclaimers and agree to independently verify my tax submissions."

- **Registry Flag:** Acceptance must be saved as a persistent database state:

```text
eula_accepted = true
```

## Mandatory EULA Liability Clause

### LIMITATION OF LIABILITY & TAX SYSTEM DISCLAIMER

1. **AS-IS Software Delivery**
   - The software "Phone Zone" is provided "as is" without warranty of any kind, express or implied.

2. **Calculation Responsibility**
   - The final calculation and verification of tax balances (CGST, SGST, Base Margins, and HSN codes) are the sole responsibility of the End-User and their Chartered Accountant (CA).

3. **Indemnity against Penalties**
   - Under no circumstances shall the software developer be liable for any tax penalties, regulatory audits, lost profits, or business interruptions caused by incorrect database outputs, locking errors, or computation mismatch.

4. **Liability Cap**
   - Financial remedy under any legal claims is strictly capped at the total amount paid by the customer for the software license.

---

# 3. Database Architecture Revisions

The database schema must be revised to accommodate:

- 15-digit IMEI tracking on invoices.
- HSN numbers in the item catalog.
- Persistent custom contact details.

## A. Items Table (Inventory Catalog)

| Field Name | Storage Class | Constraints / Behavior |
|------------|--------------|------------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL (Product name snapshot) |
| category | TEXT | CHECK IN ('New Phone', 'Accessory', 'Used Phone', 'Repair Service') |
| stock_qty | INTEGER | DEFAULT 0 |
| purchase_price | REAL | DEFAULT 0.0 |
| sell_price | REAL | DEFAULT 0.0 (Inclusive of GST) |
| gst_rate | REAL | DEFAULT 18.0 |
| is_margin_scheme | INTEGER | DEFAULT 0 (0 = Standard, 1 = Margin Scheme Eligible) |
| hsn_code | TEXT | NOT NULL, DEFAULT '8471' (6 to 8 digit tracking) |

## B. Sale Items Table (Invoice Line Snapshot)

| Field Name | Storage Class | Constraints / Behavior |
|------------|--------------|------------------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| sale_id | INTEGER | FOREIGN KEY referencing sales(id) ON DELETE CASCADE |
| item_id | INTEGER | FOREIGN KEY referencing items(id) ON DELETE SET NULL |
| item_name | TEXT | NOT NULL (Captured title snapshot) |
| qty | INTEGER | NOT NULL |
| price_per_unit | REAL | NOT NULL |
| is_margin_applied | INTEGER | DEFAULT 0 (Active Margin flag) |
| cgst_amount | REAL | NOT NULL |
| sgst_amount | REAL | NOT NULL |
| imei_number | TEXT | DEFAULT '' (Optional 15-digit IMEI tracking) |
| item_hsn | TEXT | DEFAULT '' (Captured HSN snapshot) |

## C. Settings Registry Keys

Store settings are maintained dynamically as key-value pairs inside the settings table.

### Required Keys

- `shop_name` — Store legal name for invoice branding.
- `shop_address` — Physical multi-line location.
- `shop_gstin` — 15-character GST Identification Number.
- `shop_email` — Professional contact email ID.
- `shop_phone` — Official business phone/mobile number.
- `default_gst_rate` — Global default tax percentage.
- `app_theme` — GUI color profile selection.
- `bank_name`
- `bank_acc_name`
- `bank_acc_no`
- `bank_ifsc`
- `bank_branch`

---

# 4. UI Refinements & User Experience Safeguards

To prevent operational data loss and layout issues, the user interface must enforce specific behavioral rules.

## A. Accidental Modal Dismissal Prevention (Anti-Data-Loss)

### Problem
If a user accidentally clicks the modal backdrop, the modal closes and all entered data is lost.

### Refined Rule
- Backdrop must not listen for click/close events.
- Modal closes only through:
  - **Cancel**
  - **× (Close)**

Clicking outside the modal does nothing.

---

## B. Explicit Settings Save Model

### Problem
Auto-saving may cause excessive DB writes and locking issues.

### Refined Rule

Remove all auto-save behavior.

Add a dedicated:

**"Save System Settings"**

button.

The following values remain in memory until explicitly saved:

- Shop Name
- Email ID
- Phone Number
- Address
- GSTIN
- Default GST
- Theme
- Bank Configuration

---

## C. Non-Clipping Toast Notification System

### Problem
Toast notifications may clip at the top edge of the screen.

### Refined Rule

Toast container must use:

```css
top: 50px-60px;
z-index: 999999;
```

Requirements:

- Stack downward cleanly.
- Prevent overlap.
- Prevent clipping on different screen resolutions.

---

# 5. Professional Invoice Structure & A4 Print Layout

The invoice layout must match professional mobile retail invoice formats.

## A. Aesthetic & Watermark Elements

### Background Watermark
- Center-aligned faded SVG logo.

### Watermark Opacity

```css
opacity: 0.03 - 0.05;
```

### No UI Chrome

Hide via:

```css
@media print
```

Elements hidden:

- Sidebars
- Navigation links
- Filters
- Window buttons

---

## B. Dual-Column Metadata Layout

### Left Column (Buyer)

- Customer Name
- Shipping/Billing Address
- Phone Number
- Customer GSTIN

### Right Column (Document)

- Invoice Number
- Billing Date
- Mode of Payment

---

## C. Document Columns

| Column | Description |
|----------|-------------|
| S.No. | Serial Number |
| HSN | 6-8 digit code |
| Item Description | Product Name + IMEI on next line |
| Qty | Units billed |
| Rate | Tax-inclusive sell rate |
| Amount | Qty × Rate |

### IMEI Format

```text
[IMEI: 123456789012345]
```

Shown only for:

- New Phone
- Used Phone

---

## D. Footer Components

### Bank Settlement Box

Defaults:

| Field | Default Value |
|---------|--------------|
| Bank Name | HDFC BANK |
| Account Name | PHONE ZONE |
| Account Number | 50200076937705 |
| IFSC | HDFC0008059 |
| Branch | Jaripatka Nagpur |

### Terms & Conditions

- Goods once sold will not be returned or refunded.
- Interest at 24% per annum applies on delayed payments.

### Declaration Statement

Certifies GST compliance.

### Signature Alignment

**Lower Left**

```text
Customer's Signature & Stamp
```

**Lower Right**

```text
For PHONE ZONE (Authorised Signatory)
```

---

## E. Print Layout Format Map

```text
┌─────────────────────────────────────────────┐
│ PHONE ZONE                                  │
│ [shop_address]                              │
│ Phone: [shop_phone] | Email: [shop_email]   │
│ GSTIN: [shop_gstin]                         │
├─────────────────────────────────────────────┤
│ TAX INVOICE                                 │
│ Invoice No: YYYYMMDD-HHMMSS-NNN             │
│ Date: DD/MM/YYYY HH:MM                      │
│ Customer: [name] GSTIN: [gstin]             │
│ Payment: [mode]                             │
├──────────┬──────┬────────┬───────┬──────────┤
│ Item     │ Qty  │ Rate   │ GST   │ Amount   │
├──────────┼──────┼────────┼───────┼──────────┤
│ ...      │ ...  │ ...    │ ...   │ ...      │
├──────────┴──────┴────────┴───────┴──────────┤
│ Taxable Base: ₹ XX,XXX.XX                   │
│ CGST (X%): ₹ XXX.XX                         │
│ SGST (X%): ₹ XXX.XX                         │
│ GRAND TOTAL: ₹ XX,XXX.XX                    │
└─────────────────────────────────────────────┘
```

---

# 6. Tax Engine Core Rules

## A. Standard GST (Inclusive Calculation)

Applicable to:

- New Phones
- Accessories
- Repairs
- Standard Used Phones

```text
Taxable Base = unit_price / (1 + gst_rate / 100)

Total GST = unit_price - Taxable Base

CGST Amount = Total GST / 2

SGST Amount = Total GST / 2
```

---

## B. Second-Hand Goods Margin Scheme (Scheme B)

Applicable only to:

- Used Phones
- Margin Scheme enabled

```text
Margin = sell_price - item.purchase_price
```

### If Margin <= 0

```text
CGST = 0
SGST = 0
Taxable Base = 0
```

### Else

```text
Taxable Margin = Margin / (1 + gst_rate / 100)

Total GST = Margin - Taxable Margin

CGST Amount = Total GST / 2

SGST Amount = Total GST / 2

Taxable Base = Taxable Margin
```

---

## C. Invoice Masking Rules (Margin Scheme Privacy Rule)

When:

```text
is_margin_applied = 1
```

### Printed Invoice

Suppress:

- CGST
- SGST
- Taxable Base

### GST Column Display

```text
GST paid under Margin Scheme
```

The Grand Total remains fully accurate.