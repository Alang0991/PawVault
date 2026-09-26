# PawVault — Stripe Checkout & Marketplace Payments

## Purpose

PawVault needs a proper marketplace payment system where:

1. Customers pay through Stripe.
2. PawVault knows exactly which creator owns each purchased product.
3. The money attributable to each product is tracked to that creator.
4. PawVault keeps its platform fee where applicable.
5. Creators receive their money through Stripe Connect.
6. Orders, payments, transfers, refunds, disputes, and payouts are all linked together.
7. A customer can buy products from multiple creators in one checkout.
8. Creator ownership is never confused with PawVault ownership.
9. The payment system is auditable and recoverable.
10. No money is silently lost, duplicated, or assigned to the wrong creator.

This is a **financially sensitive system**.

Do not implement it as a simple:

```text
checkout → mark order paid
```

It needs proper payment state, seller allocation, Stripe IDs, webhook processing, reconciliation, refunds, and audit history.

---

# 1. STRIPE PRODUCT

PawVault is a marketplace.

Stripe Connect is designed for marketplaces that collect customer payments and move funds to sellers/service providers. Stripe's current marketplace documentation specifically supports marketplaces selling physical or digital goods and services. citeturn2view1turn1view0

PawVault should use:

```text
Stripe
+
Stripe Connect
+
PawVault's own order/payment ledger
```

Stripe is the payment processor and connected-account/payout infrastructure.

PawVault remains the source of truth for:

- Products
- Creators
- Orders
- Order items
- Creator ownership
- Product prices
- Marketplace fees
- Customer entitlements
- Internal payment state
- Internal reconciliation

---

# 2. IMPORTANT — DO NOT GUESS THE STRIPE ARCHITECTURE

Before implementing payment code:

- Inspect the existing codebase.
- Find existing Stripe integration.
- Find existing checkout endpoints.
- Find existing order/payment models.
- Find existing creator payout fields.
- Find existing environment variables.
- Find existing webhook handlers.
- Find existing payment status enums.
- Find existing refund logic.
- Find existing cart logic.

Do not create a second payment system beside an existing one.

If Stripe is already partially implemented, extend and repair it rather than duplicating it.

---

# 3. MULTI-CREATOR CART REQUIREMENT

This is one of the most important requirements.

A PawVault cart can contain:

```text
Creator A — Product A — £20
Creator B — Product B — £15
Creator C — Product C — £10
```

The customer should be able to pay for the cart as one checkout where the payment architecture supports it.

After payment, PawVault must know:

```text
£20 → Creator A
£15 → Creator B
£10 → Creator C
```

minus:

- PawVault's applicable platform fee
- Any applicable refunds/adjustments
- Any payment-related allocation rules
- Any other explicitly configured marketplace deduction

Never simply send the whole order amount to one creator.

---

# 4. STRIPE CONNECT

Each eligible creator who receives marketplace earnings needs a Stripe Connect connected account.

Stripe's current documentation recommends Accounts v2 for new Connect integrations and notes that legacy Standard/Express/Custom account terminology applies to older integrations. citeturn1view2

Kilo must inspect the current Stripe integration and determine whether PawVault is:

```text
Accounts v2
```

or an existing legacy Connect configuration.

Do not blindly replace an existing production payment integration.

---

# 5. CREATOR STRIPE ACCOUNT

Creator model should have a secure reference to the Stripe connected account.

Example conceptual fields:

```text
creator_id
stripe_connected_account_id
stripe_onboarding_status
stripe_charges_enabled
stripe_payouts_enabled
stripe_details_submitted
stripe_requirements_status
stripe_country
stripe_account_created_at
stripe_account_updated_at
```

Use the actual existing schema conventions.

Never store:

- Bank account numbers
- Card numbers
- Government IDs
- Full identity documents

inside ordinary PawVault creator tables.

Stripe should handle sensitive payment identity information wherever possible.

---

# 6. CREATOR ONBOARDING

A creator should not be considered payout-ready merely because they clicked:

```text
Connect Stripe
```

The backend must know whether Stripe has actually enabled the required capabilities.

Creator payout status should distinguish:

```text
Not connected
Onboarding
Verification required
Restricted
Ready
Disabled
```

Use actual Stripe account state.

Do not fake:

```text
Payouts enabled
```

---

# 7. CREATOR PAYOUT UI

Creator Hub should eventually show:

```text
Stripe
Connected / Not connected

Payout status
Ready / Action required

Available balance
Pending balance

Recent payouts
```

Sensitive bank information should remain handled by Stripe.

PawVault should show only the information necessary for the creator experience.

---

# 8. PAYMENT MODEL

PawVault needs separate concepts for:

```text
Order
Payment
Order item
Creator allocation
Transfer
Payout
Refund
Dispute
Platform fee
```

Do not collapse these into one `orders.status`.

---

# 9. ORDER

An order represents what the customer purchased.

Conceptual:

```text
Order
├── Customer
├── Currency
├── Subtotal
├── Discounts
├── Tax if applicable
├── Total
├── Payment status
├── Fulfillment status
└── Order items
```

---

# 10. ORDER ITEM

Every purchased product should be its own order item.

Example:

```text
Order #1001

Item 1
Product: Cyber Avatar
Creator: Creator A
Price: £20

Item 2
Product: Shader Pack
Creator: Creator B
Price: £15
```

The creator relationship must be captured at purchase time.

Do not rely only on:

```text
product.creator_id
```

for historical accounting.

---

# 11. CREATOR SNAPSHOT

When an order is created, preserve the seller information needed for financial history.

Example:

```text
creator_id
creator_display_name
product_id
product_title
unit_price
quantity
currency
platform_fee
creator_gross
creator_net
```

Use immutable order records.

If a creator later changes their username, historical orders must not change their financial meaning.

---

# 12. MONEY MUST USE INTEGER MINOR UNITS

Never calculate financial amounts using JavaScript floating point values.

Use:

```text
integer minor units
```

Example:

```text
£19.99
→
1999
```

Store currency separately:

```text
amount = 1999
currency = GBP
```

All calculations must be deterministic.

---

# 13. NEVER USE FLOATS FOR MONEY

Bad:

```text
19.99 * 0.9
```

Good:

```text
1999
×
percentage/fee calculation
→
integer minor units
```

Use a dedicated money/rounding utility.

---

# 14. CURRENCY

Every monetary record must explicitly store currency.

Example:

```text
GBP
USD
EUR
```

Do not infer currency from the user's locale.

Do not assume PawVault is permanently GBP-only.

---

# 15. PRICE SNAPSHOT

At checkout/order creation, snapshot:

```text
Product price
Currency
Discount
Creator
Platform fee rule
```

Do not recalculate historical order values from the current product price.

---

# 16. PRICE CHANGES

Creator changes:

```text
£20 → £25
```

Existing orders remain:

```text
£20
```

Future orders use:

```text
£25
```

Do not rewrite old orders.

---

# 17. DISCOUNTS

Discounts must be allocated deterministically.

Example:

```text
Creator A product = £20
Creator B product = £10

Cart subtotal = £30

£3 cart discount
```

The system must define exactly how the £3 is distributed.

Possible rule:

```text
Proportional allocation
```

or an explicitly defined item-level discount model.

The same calculation must be reproducible for:

- Order
- Creator allocation
- Refund
- Reporting
- Reconciliation

---

# 18. TAX

Do not invent tax logic.

First inspect the existing PawVault tax/payment architecture and business model.

If Stripe Tax or another tax system is used, integrate it properly.

Stripe Connect supports Stripe Tax for Connect integrations. citeturn1view0

Tax responsibility can depend on PawVault's legal/business model and country.

This requires proper legal/accounting review before launch.

---

# 19. MERCHANT OF RECORD

Do not assume whether:

```text
PawVault
```

or:

```text
Creator
```

is the merchant of record.

This is a legal/business decision.

Stripe's marketplace model documentation describes a configuration where the platform is merchant of record and manages payments, refunds, disputes, and seller payouts. citeturn2view1

Kilo must not silently choose a legal model.

The implementation must follow the business/legal decision made for PawVault.

---

# 20. PLATFORM FEE

PawVault needs an explicit platform-fee model.

Example:

```text
Product: £20.00
Platform fee: £2.00
Creator allocation: £18.00
```

The actual percentage/amount must come from PawVault's configured business rules.

Never hard-code an assumed commission percentage.

---

# 21. FEE VERSIONING

When the platform fee changes:

```text
Old order
→ old fee rule

New order
→ new fee rule
```

Store enough information to explain the fee applied to each order.

---

# 22. APPLICATION FEES

Stripe Connect supports marketplace monetization by retaining part of a transaction as an application fee or paying only a portion to the connected account. citeturn2view1

Kilo should determine the correct Stripe Connect mechanism for PawVault's chosen marketplace configuration.

Do not manually fake a transfer ledger while Stripe moves the full amount without matching records.

---

# 23. SINGLE-CREATOR CHECKOUT

If a checkout contains only one creator's products, PawVault may use an appropriate Connect charge flow.

Stripe supports destination charges where the platform creates the charge, collects its fee, and transfers the remaining funds to a connected account. citeturn1view1

Use this only if it fits the selected PawVault architecture.

---

# 24. MULTI-CREATOR CHECKOUT

For carts containing multiple creators, PawVault needs a payment architecture capable of distributing funds to multiple connected accounts.

Stripe documents **separate charges and transfers** specifically for creating a platform charge and transferring funds to multiple connected accounts. citeturn2view0

This is highly relevant to PawVault's multi-creator cart.

Kilo must implement the correct Stripe-supported flow rather than assuming a single destination account can represent the whole cart.

---

# 25. RECOMMENDED CONCEPTUAL FLOW

```text
Customer cart
      ↓
PawVault validates cart
      ↓
Snapshot products/prices/creators
      ↓
Calculate subtotal
      ↓
Calculate discounts
      ↓
Calculate applicable tax
      ↓
Calculate creator allocations
      ↓
Calculate PawVault fee
      ↓
Create Stripe checkout/payment
      ↓
Customer pays
      ↓
Stripe webhook confirms payment
      ↓
PawVault finalizes order
      ↓
Creator allocations become payable
      ↓
Stripe Connect transfers/payout flow
      ↓
Creator receives funds
```

The browser must never be the authority for payment success.

---

# 26. CHECKOUT CREATION

The server must create checkout/payment sessions.

Do not trust the client to submit:

```text
price
creator_id
platform_fee
total
currency
```

The client should submit product/cart references.

The server recalculates everything from authoritative database data.

---

# 27. CHECKOUT VALIDATION

Before creating payment:

```text
Validate user
Validate cart
Validate product availability
Validate product ownership
Validate price
Validate currency
Validate creator status
Validate product status
Validate purchase eligibility
Validate entitlement state
Validate discount
Validate inventory if applicable
Validate Stripe payout readiness where required
```

For digital products, do not block a customer's purchase merely because a creator payout is temporarily pending unless PawVault's business rules explicitly require it.

---

# 28. PRICE TAMPERING PROTECTION

Never trust:

```text
frontend total
frontend price
frontend creator ID
frontend fee
frontend discount amount
```

The backend must calculate:

```text
authoritative total
```

---

# 29. CART SNAPSHOT

At checkout creation, create a stable payment snapshot.

Example:

```text
checkout_id
order_id
items
prices
creator allocations
discount allocations
fees
tax
currency
```

This prevents later product edits from changing an in-progress payment.

---

# 30. IDEMPOTENCY

Every payment operation needs idempotency.

Examples:

```text
create checkout
create order
finalize payment
create transfer
process refund
process webhook
```

A retry must not:

```text
charge twice
create two orders
transfer twice
refund twice
```

---

# 31. STRIPE WEBHOOKS

Stripe webhooks must be first-class infrastructure.

Do not rely on:

```text
customer returned to success page
```

to mark an order paid.

Payment confirmation must come from verified Stripe events.

---

# 32. WEBHOOK SECURITY

Webhook handling must:

- Verify Stripe signatures
- Reject invalid signatures
- Store event IDs
- Be idempotent
- Process events safely
- Record processing status
- Retry failed processing
- Avoid duplicate financial actions

Never trust arbitrary POST requests claiming:

```text
payment successful
```

---

# 33. WEBHOOK EVENT STORAGE

Store a webhook/event record.

Conceptual:

```text
stripe_event_id
event_type
received_at
processed_at
processing_status
attempt_count
error
payload_reference
```

Do not blindly store unnecessary sensitive payload data forever.

---

# 34. PAYMENT STATUS

Use explicit states.

Example:

```text
CREATED
CHECKOUT_OPEN
PROCESSING
PAID
FAILED
CANCELED
REFUNDED
PARTIALLY_REFUNDED
DISPUTED
```

Use the actual system's naming convention.

---

# 35. ORDER STATUS VS PAYMENT STATUS

Do not mix:

```text
payment status
```

with:

```text
fulfillment/access status
```

A payment can be:

```text
PAID
```

while a product file is:

```text
PROCESSING
```

These are separate concerns.

---

# 36. DIGITAL PRODUCT FULFILLMENT

After confirmed payment:

```text
Payment confirmed
↓
Order finalized
↓
Customer entitlement created
↓
Download access granted
↓
Creator sale recorded
↓
Notifications sent
```

Do not grant downloads based solely on a frontend success redirect.

---

# 37. CUSTOMER RECEIPT

Checkout confirmation should show:

```text
Order number
Products
Creators
Subtotal
Discount
Tax where applicable
Total
```

The receipt should accurately represent what the customer purchased.

---

# 38. CREATOR ORDER VIEW

Creator Hub should eventually show only the creator's relevant items.

Example:

```text
Order #1001

Cyber Avatar
£20

Customer
[limited permitted information]

Status
Paid
```

Creator A should not automatically see Creator B's product/order details.

---

# 39. CREATOR REVENUE

Creator revenue should distinguish:

```text
Gross sales
Discounts
Platform fees
Refunds
Net creator earnings
Pending
Available
Paid out
```

This avoids misleading creators with gross sales presented as withdrawable money.

---

# 40. PLATFORM REVENUE

PawVault reporting should distinguish:

```text
Gross marketplace volume
Platform fees
Stripe/payment costs
Refunds
Disputes
Net platform revenue
```

Do not call gross order volume:

```text
PawVault revenue
```

---

# 41. CREATOR BALANCE

Creator balance should distinguish:

```text
Pending
Available
Paid out
```

Do not show a payment as available merely because the customer's card succeeded.

The exact availability timing depends on the Stripe Connect configuration and risk/payout rules.

---

# 42. PAYOUTS

Stripe Connect manages payouts to connected accounts in supported configurations. Stripe documents connected-account payout management as part of Connect. citeturn1view0

PawVault should show payout state without attempting to replace Stripe's banking infrastructure.

---

# 43. PAYOUT RECORD

Store:

```text
creator_id
stripe_connected_account_id
stripe_payout_id
amount
currency
status
created_at
arrival/paid_at
```

Use Stripe IDs for reconciliation.

---

# 44. TRANSFER RECORD

Where the chosen Connect architecture uses transfers, store:

```text
stripe_transfer_id
order_id
creator_id
amount
currency
status
created_at
```

Every transfer must map back to the underlying order allocation.

---

# 45. ONE TRANSFER PER ALLOCATION

For a multi-creator order:

```text
Order 1001

Creator A → allocation A → Stripe transfer A
Creator B → allocation B → Stripe transfer B
Creator C → allocation C → Stripe transfer C
```

Do not create ambiguous lump-sum transfers.

---

# 46. ALLOCATION LEDGER

PawVault should maintain an internal immutable financial allocation record.

Example:

```text
Order item
↓
Gross item amount
↓
Discount allocation
↓
Tax allocation
↓
Platform fee
↓
Creator net allocation
↓
Transfer
↓
Payout
```

This becomes the reconciliation backbone.

---

# 47. IMMUTABLE FINANCIAL RECORDS

Do not edit completed financial records in place.

If something changes:

```text
Original record
+
Adjustment/refund/dispute record
```

rather than rewriting history.

---

# 48. REFUNDS

Refunds must reverse the correct financial allocations.

Example:

```text
Customer paid £30

Creator A allocation £20
Creator B allocation £10

Full refund
↓
Creator A allocation reversed
Creator B allocation reversed
Platform fee adjusted according to policy
```

The exact Stripe mechanics must follow the chosen Connect charge/transfer architecture.

Do not simply mark the order refunded in PawVault while leaving transfers untouched.

---

# 49. PARTIAL REFUNDS

Partial refunds must identify the affected order item(s) or allocation.

Example:

```text
Order
├── Product A £20
└── Product B £10

Refund Product B £10
```

Only the appropriate creator allocation is reversed.

---

# 50. REFUND OWNERSHIP

PawVault must know:

```text
Which creator's product was refunded?
How much was refunded?
How much of the creator allocation was reversed?
What platform fee adjustment occurred?
```

---

# 51. DISPUTES / CHARGEBACKS

Disputes must be linked to:

```text
Stripe payment
Order
Customer
Creator allocations
Transfers
Product
```

The system should preserve evidence.

---

# 52. DISPUTE EVIDENCE

Where legally and operationally appropriate, preserve:

- Order details
- Product information
- License
- Download/access records
- Customer communication
- Refund history
- Relevant support ticket
- Payment information reference

Do not store unnecessary sensitive card data.

---

# 53. CREATOR OWNERSHIP

A creator receiving money does not mean PawVault owns the product.

Likewise:

```text
Stripe connected account
```

does not determine:

```text
PawVault product ownership
```

PawVault's product database remains authoritative for creator ownership.

---

# 54. CREATOR PAYOUT SUSPENSION

If a creator is suspended:

```text
Creator access
→ restricted

Payout state
→ handled according to policy and legal/payment requirements
```

Do not automatically erase financial records.

Do not transfer creator ownership to PawVault.

---

# 55. MODERATION + PAYMENTS

Moderators should not automatically receive:

```text
Stripe account management
Payout editing
Bank information
Refund authority
```

unless their explicit permission set includes the relevant financial operation.

Moderation and finance must remain separate permission domains.

---

# 56. SUPPORT + PAYMENTS

Support may need read-only payment context:

```text
Order
Payment status
Refund status
Creator
Product
```

Support should not automatically be able to:

```text
change payout destination
create arbitrary transfers
change payment amount
```

---

# 57. FOUNDER + PAYMENTS

Founder has platform administration authority, but financial actions should still be explicit and audited.

Do not create a dangerous:

```text
manage_everything
```

shortcut that allows arbitrary Stripe money movement.

---

# 58. FINANCIAL PERMISSIONS

Recommended permission concepts:

```text
PAYMENT_VIEW
PAYMENT_REFUND
PAYMENT_DISPUTE_VIEW
PAYOUT_VIEW
PAYOUT_MANAGE
STRIPE_ACCOUNT_VIEW
STRIPE_ACCOUNT_MANAGE
FINANCE_REPORT_VIEW
FINANCE_RECONCILE
```

Use the actual PawVault permission system.

---

# 59. CREATOR STRIPE CONNECTION

Creator flow:

```text
Creator Hub
↓
Payouts
↓
Connect Stripe
↓
Stripe onboarding
↓
Stripe verification
↓
Return to PawVault
↓
Server checks actual account state
↓
Payout status updated
```

Do not mark the creator ready based solely on the return URL.

---

# 60. STRIPE ONBOARDING STATE

Possible internal states:

```text
NOT_STARTED
ONBOARDING
REQUIRES_INFORMATION
RESTRICTED
READY
DISCONNECTED
```

Map these to actual Stripe data.

---

# 61. REQUIREMENTS CHANGES

Stripe may require additional verification information later.

The creator experience should be able to show:

```text
Action required

Stripe needs additional information to keep payouts enabled.

[Complete Stripe verification]
```

Do not silently assume onboarding remains complete forever.

---

# 62. CREATOR PAYOUT BLOCK

If payouts are unavailable:

```text
Payouts currently unavailable.

Reason:
Additional Stripe verification is required.

[Complete verification]
```

Use safe, understandable language.

---

# 63. CHECKOUT UX

Checkout should clearly show:

```text
Your order

Creator A
Product
£20

Creator B
Product
£15

Subtotal
£35

Discount
-£5

Total
£30
```

Do not expose internal Stripe transfer mechanics to the customer.

---

# 64. CUSTOMER SHOULD NOT NEED TO UNDERSTAND CONNECT

Stripe Connect is infrastructure.

The customer should primarily experience:

```text
PawVault checkout
```

not:

```text
Stripe Connect transfer architecture
```

---

# 65. PAYMENT SUCCESS

Never treat:

```text
Stripe Checkout success redirect
```

as the final authority.

The page can say:

```text
Payment processing...
```

until PawVault receives and processes the authoritative payment event.

---

# 66. PAYMENT PROCESSING PAGE

If webhook confirmation is delayed:

```text
We're confirming your payment.

You don't need to pay again.

This page will update automatically.
```

This is better than creating a duplicate checkout.

---

# 67. DUPLICATE PAYMENT PROTECTION

If a customer refreshes:

```text
success page
```

do not create:

```text
second order
second payment
second entitlement
```

Use order/payment idempotency.

---

# 68. CHECKOUT EXPIRATION

Expired checkout sessions must not become paid orders.

If the customer returns to an expired session:

```text
Your checkout has expired.

[Return to Cart]
```

---

# 69. CART VALIDATION BEFORE PAYMENT

Revalidate immediately before payment creation.

Check:

```text
Product still available
Price still valid
Creator still eligible
Currency compatible
Product not already owned where appropriate
Discount still valid
```

If something changed:

```text
Your cart has changed.
Please review before paying.
```

Do not silently charge a different amount.

---

# 70. OWNED PRODUCT

If a customer already owns a product:

```text
Owned
```

should be visible.

The cart should not accidentally charge them again unless the product's business model explicitly permits repeat purchase.

---

# 71. DIGITAL ENTITLEMENT

Payment creates:

```text
Entitlement
```

not direct unrestricted file access.

Download authorization should check:

```text
customer
+
product
+
valid entitlement
+
license
+
product availability
```

---

# 72. DOWNLOAD AFTER REFUND

If a refund revokes entitlement under PawVault policy:

```text
Refund
↓
Entitlement state updated
↓
Download access updated
```

The exact rule must follow the published refund/license policy.

---

# 73. PAYMENT AUDIT LOG

Financial actions should create audit entries.

Examples:

```text
Checkout created
Payment confirmed
Transfer created
Refund requested
Refund completed
Payout observed
Dispute opened
Dispute resolved
```

Include actor/source and relevant Stripe IDs.

---

# 74. STRIPE ID MAPPING

Store Stripe identifiers safely.

Examples:

```text
stripe_customer_id
stripe_checkout_session_id
stripe_payment_intent_id
stripe_charge_id
stripe_connected_account_id
stripe_transfer_id
stripe_payout_id
stripe_refund_id
stripe_dispute_id
stripe_event_id
```

Only add IDs actually required by the implementation.

---

# 75. WEBHOOK REPLAY

Admin tooling should eventually support safe webhook replay.

Example:

```text
Stripe event
↓
Processing failed
↓
Retry
```

Replay must be idempotent.

Never blindly repeat a transfer/refund because an event was replayed.

---

# 76. RECONCILIATION

PawVault needs a reconciliation process.

Compare:

```text
PawVault orders
vs
Stripe payments
vs
Stripe transfers
vs
Stripe refunds
vs
Stripe payouts
```

Find mismatches such as:

```text
Paid in Stripe but missing in PawVault
Order paid but transfer missing
Transfer amount mismatch
Refund mismatch
Duplicate allocation
```

---

# 77. RECONCILIATION STATES

Example:

```text
MATCHED
MISSING_PAYMENT
MISSING_TRANSFER
AMOUNT_MISMATCH
REFUND_MISMATCH
DUPLICATE
MANUAL_REVIEW
```

Do not silently correct financial discrepancies.

---

# 78. FINANCIAL ALERTS

Create alerts for:

```text
Payment webhook failures
Transfer failures
Refund failures
Stripe account restrictions
Payout failures
Reconciliation mismatches
Unexpected negative balances
```

---

# 79. FINANCIAL DASHBOARD

Founder/Admin finance dashboard should eventually show:

```text
Gross sales
Platform fees
Creator allocations
Transfers
Refunds
Disputes
Payouts
Reconciliation issues
```

Use real data.

---

# 80. CREATOR PAYOUT DASHBOARD

Creator should see:

```text
Pending
Available
Paid out
```

plus:

```text
Sales
Fees
Refunds
Payout history
```

where appropriate.

---

# 81. FINANCIAL PRIVACY

Creators should only see their own financial information.

Customer should only see their own purchases.

Moderator should only see payment information if explicitly authorized.

---

# 82. STRIPE DASHBOARD

Stripe remains the source of Stripe-specific account/payout information.

PawVault should link creators to Stripe onboarding/dashboard functionality only through supported Connect flows.

Do not recreate sensitive banking settings inside PawVault unnecessarily.

---

# 83. ENVIRONMENT SEPARATION

Use:

```text
Stripe Test
Stripe Live
```

separately.

Never use live payment credentials locally unless explicitly required and secured.

---

# 84. ENVIRONMENT VARIABLES

Do not invent variables without inspecting the existing code.

Kilo must audit the project and produce the exact variables currently required.

Likely categories include:

```text
Stripe secret key
Stripe publishable key
Stripe webhook secret
Stripe Connect configuration
Application URL
```

But the actual variable names must match PawVault's codebase.

---

# 85. SECRET HANDLING

Never expose:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

to browser/client code.

Only publishable/client-safe values may be exposed where required.

---

# 86. TEST MODE

Before live payments:

Test:

```text
Single creator checkout
Multi-creator checkout
Free product
Discount
Partial refund
Full refund
Failed payment
Canceled checkout
Webhook retry
Duplicate webhook
Transfer failure
Creator onboarding incomplete
Creator onboarding complete
Customer already owns product
```

---

# 87. TEST MULTI-CREATOR MONEY FLOW

Example:

```text
Creator A product = £20
Creator B product = £30

Customer total = £50

PawVault fee = configured amount

Expected:

Creator A allocation = correct
Creator B allocation = correct
PawVault fee = correct
Stripe payment = correct
Transfers = correct
```

Verify all records.

---

# 88. ROUNDING TEST

Test:

```text
£0.01
£0.99
£1.01
£19.99
£99.99
```

and multi-item orders where allocation produces fractional percentages.

Every penny must have a deterministic destination.

---

# 89. CURRENCY TEST

Test supported currencies individually.

Do not accidentally mix:

```text
GBP
USD
EUR
```

inside a payment flow that does not support the combination.

---

# 90. REFUND TEST

Test:

```text
Full order refund
Single item refund
Multi-item partial refund
Repeated refund request
Refund after transfer
Refund after payout
```

The implementation must follow Stripe's supported behavior for the chosen Connect architecture.

---

# 91. DISPUTE TEST

Test:

```text
Dispute created
Dispute updated
Dispute won
Dispute lost
```

Ensure the PawVault financial ledger remains consistent.

---

# 92. CREATOR RESTRICTION TEST

Test a creator whose Stripe account is:

```text
Not onboarded
Needs information
Restricted
Ready
```

Checkout and payout behavior must match the business rules.

---

# 93. SESSION / ROLE TEST

The payment system must follow the global PawVault authentication rule.

If a user gains creator access:

```text
No logout/login required.
```

If a creator's permissions change:

```text
No logout/login required.
```

Only genuine session/security invalidation should require re-authentication.

---

# 94. PAYMENT AUTHORIZATION

Never trust role information from the frontend.

Server checks:

```text
authenticated user
+
permission
+
creator ownership
+
financial action authorization
```

---

# 95. CUSTOMER OWNERSHIP

A customer must not be able to alter:

```text
creator allocation
price
platform fee
Stripe destination
refund amount
```

by editing request payloads.

---

# 96. CREATOR OWNERSHIP

A creator must not be able to change:

```text
another creator's Stripe account
another creator's product allocation
another creator's payout
```

through manipulated API requests.

---

# 97. STAFF OWNERSHIP

Staff actions must respect scope.

For example:

```text
MODERATOR
→ moderation

SUPPORT
→ support

FINANCE
→ finance

FOUNDER
→ platform administration
```

Do not automatically grant Stripe money movement to every staff role.

---

# 98. PAYMENT API DESIGN

Payment endpoints should be explicit.

Examples conceptually:

```text
POST /api/checkout
GET  /api/checkout/[id]
GET  /api/orders/[id]
POST /api/orders/[id]/refund
GET  /api/creator/payouts
GET  /api/creator/earnings
POST /api/stripe/webhook
```

Use the existing API conventions.

Do not create duplicate routes if equivalents already exist.

---

# 99. ERROR SEMANTICS

Use correct HTTP semantics.

```text
400 / 422
→ invalid checkout input

401
→ not authenticated

403
→ authenticated but not authorized

404
→ resource does not exist / not visible

409
→ state conflict

500
→ server failure
```

Do not turn every error into:

```text
Invalid input.
```

---

# 100. PAYMENT ERROR UX

Customer-facing errors should be understandable.

Bad:

```text
StripeInvalidRequestError
```

Good:

```text
We couldn't start checkout.

Your cart has not been charged.

Please try again.
```

Log the detailed technical error internally.

---

# 101. NO FALSE SUCCESS

Never show:

```text
Payment successful
```

unless the server has authoritative confirmation.

Never create a creator earning record from a frontend-only success state.

---

# 102. NO FALSE PAYOUT

Never show:

```text
Creator paid
```

because an order was paid.

Distinguish:

```text
Sale recorded
Creator allocation
Transfer
Payout
```

---

# 103. FINANCIAL EVENT FLOW

Use a clear event chain:

```text
CheckoutCreated
PaymentProcessing
PaymentSucceeded
OrderFinalized
EntitlementsGranted
CreatorAllocationsCreated
TransfersCreated
PayoutObserved
```

Failures should produce explicit failure states.

---

# 104. EVENT IDEMPOTENCY

Each event should have a unique identity.

Repeated event:

```text
same event ID
```

must not produce:

```text
second transfer
second entitlement
second notification
```

---

# 105. ORDER FINALIZATION

Order finalization should be transactional where possible.

Conceptually:

```text
Payment confirmed
↓
Create/finalize order
↓
Create order items
↓
Create allocations
↓
Create entitlements
↓
Queue notifications
```

If part fails, the system must recover safely.

---

# 106. ASYNCHRONOUS MONEY MOVEMENT

Where Stripe transfer creation is asynchronous, represent:

```text
pending
```

rather than pretending the money has moved.

---

# 107. TRANSFER RETRY

If a transfer fails:

```text
Record failure
↓
Do not duplicate prior successful transfer
↓
Retry safely
↓
Reconcile
```

---

# 108. FINANCIAL JOB QUEUE

Use a durable background job/outbox system for operations that should not depend on a browser request remaining open.

Potential jobs:

```text
Stripe webhook processing
Transfer creation
Refund processing
Reconciliation
Creator payout sync
Stripe account status sync
```

---

# 109. OUTBOX

Use an outbox pattern where appropriate:

```text
Database transaction
↓
Financial state recorded
↓
Outbox event recorded
↓
Worker processes Stripe operation
```

This improves reliability.

---

# 110. DO NOT HOLD MONEY IN AN ARBITRARY INTERNAL BALANCE

Do not build a fake PawVault wallet unless there is a deliberate legal/payment architecture for it.

Creator balances should represent:

```text
accounting state
```

and Stripe-connected payout state.

Do not create an unregulated internal money system by accident.

---

# 111. STORE CREDIT

If PawVault eventually adds store credit, treat it as a separate financial system.

Do not mix:

```text
Stripe creator earnings
```

with:

```text
customer store credit
```

---

# 112. GIFTING

If gifting is added later, define:

```text
payer
recipient
product
creator allocation
license recipient
refund rules
```

before implementation.

---

# 113. FREE PRODUCTS

A £0 product should not create a Stripe payment.

But PawVault should still create the appropriate:

```text
order/access record
entitlement
creator attribution
```

where the product model requires it.

Do not pretend a free download is a paid Stripe transaction.

---

# 114. PLATFORM PROMOTIONS

If PawVault subsidizes a creator product:

Do not change the creator's ownership or silently change their product price.

Use an explicit:

```text
platform subsidy
promotion allocation
support grant
```

model where appropriate.

---

# 115. CREATOR DISCOUNTS

Creator-controlled discounts should be recorded separately from:

```text
PawVault platform subsidies
```

This matters for creator earnings and reporting.

---

# 116. REFUND POLICY INTEGRATION

The payment system must follow PawVault's actual published refund policy.

Do not implement a refund rule in Stripe that contradicts the platform's documented policy.

---

# 117. CUSTOMER ENTITLEMENT PROTECTION

A payment/refund bug must not accidentally:

```text
remove unrelated products
```

or:

```text
grant unrelated products
```

Entitlements must map to specific order items.

---

# 118. CREATOR ALLOCATION PROTECTION

A payment bug must not accidentally:

```text
assign Creator A's sale to Creator B.
```

Every allocation must reference:

```text
order_item
creator_id
product_id
```

---

# 119. AUDIT TRAIL

For every financial state change, preserve:

```text
who/what initiated it
when
what changed
Stripe reference
order reference
previous state
new state
```

Automated webhook changes should identify the source as Stripe/webhook processing.

---

# 120. ADMIN FINANCE ACTIONS

Sensitive actions should require explicit confirmation.

Examples:

```text
Refund
Retry transfer
Reconcile
Disable payout
```

Show:

```text
Amount
Currency
Creator
Order
Reason
```

before confirming.

---

# 121. FINANCE ACTION LOGGING

Every manual financial action must create an audit record.

Do not allow invisible money movement.

---

# 122. RECONCILIATION UI

Founder/Admin should eventually see:

```text
Financial health

✓ 1,204 payments matched
✓ 1,192 transfers matched
⚠ 3 reconciliation issues
```

Counts must be real.

---

# 123. PAYMENT HEALTH

Monitor:

```text
Checkout failures
Payment failures
Webhook failures
Transfer failures
Refund failures
Payout failures
```

---

# 124. STRIPE OUTAGE UX

If Stripe is unavailable:

```text
Checkout temporarily unavailable.

Please try again shortly.
```

Do not create an order as paid.

---

# 125. DATABASE TRANSACTION SAFETY

Where supported, financial database updates should use transactions.

Do not create half an order.

---

# 126. CONCURRENCY

Protect against:

```text
Two checkouts for same cart
Two refunds
Two transfer jobs
Two webhook workers
```

Use:

```text
idempotency keys
unique constraints
state transitions
locks where appropriate
```

---

# 127. UNIQUE CONSTRAINTS

Use appropriate uniqueness for:

```text
Stripe event ID
Stripe payment ID
Stripe transfer ID
Stripe refund ID
Order/payment relationships
```

This prevents duplicate financial records.

---

# 128. PRODUCT OWNERSHIP SNAPSHOT

Order items should preserve the creator relationship at purchase time.

If a product changes creator ownership later through an approved transfer:

```text
Historical sale
→ remains attributed to the original seller according to the financial record.

Future sale
→ follows the new ownership state.
```

Do not rewrite financial history.

---

# 129. STORE TRANSFER

If PawVault eventually supports creator store transfers:

The payment system must define exactly how:

```text
Existing products
Existing orders
Future sales
Existing balances
Refunds
Payouts
```

are handled.

Do not automatically move old financial records.

---

# 130. ACCOUNT DELETION

Deleting/deactivating a creator account must not destroy financial records.

Use retention/anonymization policies appropriate to legal/accounting requirements.

---

# 131. CUSTOMER ACCOUNT DELETION

Customer account deletion must not corrupt:

```text
orders
payments
refunds
creator allocations
```

Retain what is legally/operationally required.

---

# 132. PAYMENT DATA RETENTION

Define retention policies for:

```text
orders
payment references
Stripe IDs
refunds
disputes
financial audit logs
webhook records
```

Do not keep raw sensitive data indefinitely without reason.

---

# 133. TEST/LIVE DATA SEPARATION

Never allow:

```text
test Stripe event
```

to mutate:

```text
live order
```

or vice versa.

---

# 134. WEBHOOK ENVIRONMENT CHECKS

The webhook system must be tied to the correct Stripe environment/configuration.

---

# 135. STRIPE API VERSION

Use the Stripe API version supported by the installed SDK/integration.

Do not mix examples from different Stripe API versions without verifying compatibility.

---

# 136. SDK

Kilo must inspect the installed Stripe SDK version before writing code.

Use the current project dependency where appropriate.

Do not blindly paste old Stripe examples into a modern codebase.

---

# 137. DOCUMENTATION SOURCE

Stripe's current Connect documentation should be treated as the implementation reference.

Relevant official documentation:

- Stripe Connect marketplace overview
- Connected accounts / Accounts v2
- Destination charges
- Separate charges and transfers
- Payouts
- Tax
- Connect onboarding

Use the current Stripe documentation rather than stale blog posts.

---

# 138. STRIPE IMPLEMENTATION PLAN

## Phase 0 — Audit

Inspect:

```text
Stripe package
.env references
Checkout API
Cart API
Order API
Payment models
Creator payout models
Webhook routes
Refund routes
```

Produce a report before changing architecture.

---

# 139. PHASE 1 — DATA MODEL

Implement/verify:

```text
orders
order_items
payments
creator_allocations
transfers
refunds
payouts
stripe_events
financial_audit
```

Use existing schemas where possible.

---

# 140. PHASE 2 — CONNECT

Implement/verify:

```text
Creator Stripe connection
Stripe onboarding
Account status sync
Payout readiness
Creator payout state
```

---

# 141. PHASE 3 — CHECKOUT

Implement:

```text
Cart validation
Price snapshot
Fee calculation
Creator allocation
Stripe Checkout
Idempotency
```

---

# 142. PHASE 4 — WEBHOOKS

Implement:

```text
Signature verification
Event storage
Idempotency
Payment confirmation
Order finalization
Entitlement creation
```

---

# 143. PHASE 5 — MONEY MOVEMENT

Implement:

```text
Creator allocations
Transfers
Transfer status
Retries
Reconciliation
```

Use the Stripe Connect charge/transfer architecture selected after the Phase 0 audit.

---

# 144. PHASE 6 — REFUNDS

Implement:

```text
Full refunds
Partial refunds
Allocation reversal
Stripe refund state
Entitlement effects
Audit logs
```

---

# 145. PHASE 7 — CREATOR FINANCE

Implement:

```text
Earnings
Pending
Available
Paid out
Fees
Refunds
Payout history
```

---

# 146. PHASE 8 — ADMIN FINANCE

Implement:

```text
Revenue reporting
Creator allocations
Transfer monitoring
Refunds
Disputes
Reconciliation
Financial audit
```

---

# 147. PHASE 9 — TESTING

Run the complete test matrix.

No live launch until:

```text
payment
+
allocation
+
transfer
+
refund
+
webhook
+
reconciliation
```

are all verified.

---

# 148. KILO TASK — FIRST PASS

Kilo should first perform an **audit only**.

Do not change code during the audit.

Report:

```text
1. Current Stripe SDK/version
2. Existing Stripe files
3. Existing checkout flow
4. Existing cart flow
5. Existing order flow
6. Existing payment models
7. Existing creator payout fields
8. Existing webhook implementation
9. Existing refund implementation
10. Existing environment variables
11. Existing Connect integration
12. Whether multi-creator checkout is currently supported
13. Whether money is currently allocated to creators
14. Existing bugs
15. Missing database fields
16. Missing API routes
17. Missing webhook events
18. Recommended migration path
```

---

# 149. KILO MUST NOT DO THIS

Do not:

- Invent Stripe IDs
- Invent payment success
- Trust frontend totals
- Trust frontend creator IDs
- Hard-code creator payout destinations in frontend code
- Store secret Stripe keys client-side
- Create duplicate Stripe integrations
- Create duplicate webhook systems
- Create duplicate order systems
- Transfer money without an internal allocation record
- Give moderators unrestricted financial permissions
- Rewrite historical orders after price changes
- Fake payout balances
- Fake transfer status
- Fake reconciliation status
- Automatically make creator products free
- Change creator ownership through payment operations
- Require logout/login for ordinary role synchronization

---

# 150. DEFINITION OF DONE

The Stripe marketplace payment system is complete when:

- [ ] Stripe integration is audited.
- [ ] Existing checkout code is understood.
- [ ] Existing order code is understood.
- [ ] Existing payment code is understood.
- [ ] Connect architecture is selected deliberately.
- [ ] Creator connected accounts work.
- [ ] Creator onboarding works.
- [ ] Creator payout readiness is real.
- [ ] Checkout validates server-side.
- [ ] Prices are server-authoritative.
- [ ] Money uses integer minor units.
- [ ] Multi-creator carts are supported correctly.
- [ ] Every order item identifies its creator.
- [ ] Creator allocations are immutable/auditable.
- [ ] Platform fees are explicit.
- [ ] Stripe payment IDs are stored.
- [ ] Stripe webhook signatures are verified.
- [ ] Webhooks are idempotent.
- [ ] Orders are not finalized from frontend redirects.
- [ ] Entitlements are created from authoritative payment confirmation.
- [ ] Transfers are correctly linked to creator allocations.
- [ ] Transfer retries are safe.
- [ ] Refunds reverse the correct allocations.
- [ ] Partial refunds work.
- [ ] Disputes are tracked.
- [ ] Creator earnings are accurate.
- [ ] Payouts are accurately represented.
- [ ] Reconciliation exists.
- [ ] Financial mismatches are surfaced.
- [ ] Finance actions are permission-controlled.
- [ ] Financial actions are audited.
- [ ] Test/live environments are separated.
- [ ] Creator ownership remains separate from payment ownership.
- [ ] Customer entitlements remain protected.
- [ ] No duplicate payment/transfer/refund can occur from retries.
- [ ] No frontend-controlled financial values are trusted.
- [ ] No fake financial data exists.
- [ ] The system survives webhook retries.
- [ ] The system survives failed jobs.
- [ ] The system handles Stripe outages safely.
- [ ] The system does not require unnecessary logout/login.
- [ ] Live-money launch has been tested thoroughly.

---

# 151. FINAL PRINCIPLE

PawVault is a marketplace.

The money flow must therefore be:

```text
Customer
   ↓
Stripe
   ↓
PawVault payment/order system
   ↓
Creator allocations
   ↓
Stripe Connect
   ↓
Correct creator
```

For a multi-creator cart:

```text
             ┌→ Creator A
             │
Customer → Stripe → PawVault allocation system
             │
             ├→ Creator B
             │
             └→ Creator C
```

Every pound/penny must have a traceable path.

Every creator sale must remain attributable to the correct creator.

Every transfer must be tied to an allocation.

Every refund must be tied back to the affected purchase.

Every financial operation must be idempotent and auditable.

And most importantly:

> **PawVault can operate the marketplace and route payments, but it must never confuse payment administration with ownership of creator content.**
