# PawVault — Customer Marketplace & Commerce

## Goal

Make buying and owning digital products reliable from discovery through long-term ownership.

## Browse and discovery

Support real:
- browsing
- search
- filters
- sorting
- categories
- creator discovery
- wishlist
- related products

Do not manufacture rankings or fake popularity.

## Product page

Real product pages should expose:
- media
- creator
- price
- sale state
- ownership state
- requirements
- versions
- files included
- license
- reviews
- updates
- related products

## Cart

Before checkout revalidate:
- product availability
- price
- ownership
- discount
- product state

## Checkout

Handle:
- success
- failure
- cancellation
- pending payment
- already owned
- invalid discount
- unavailable product
- refunds

Payment success must be verified server-side.

## Orders

Show:
- order ID
- date
- products
- creator
- subtotal
- discounts
- taxes where applicable
- total
- payment state
- refund state
- licenses

## Library

Library is the source of truth for owned products.

Show:
- product
- creator
- owned version
- latest version
- download
- license
- updates
- purchase date

## Downloads

Downloads must verify ownership and authorization. Use protected/signed URLs where appropriate. Handle unavailable files and retry.

## Licenses

Licenses must correspond to actual ownership.

Future possibilities:
- activation
- deactivation
- device limits
- regeneration
- revocation
- API validation

## Wishlist

Support add/remove/view/search/sort.

Future alerts:
- price drops
- sales
- product updates
- re-releases

## Reviews

Eligible customers can review purchases.

Support:
- rating
- written review
- images where supported
- edit/delete policy
- creator response
- reporting

## Refunds

Refunds must correctly update:
- order
- payment
- license
- ownership where policy requires
- creator accounting
- audit logs

Never just change a frontend label.

## Future gifting

Potential:
- recipient
- message
- pending gift
- claim
- ownership transfer
- license
- gift history

## Future bundles

Potential:
- bundle pricing
- bundle discounts
- ownership logic
- version updates
- partial ownership

## Future collections

Users could create private, unlisted or public collections.

## Future personalized discovery

Potential:
- recommendations
- similar products
- recently viewed
- favorite creators
- category preferences

Add privacy controls and avoid opaque/random recommendations.

## Future currency display

Users may choose a display currency. Clearly distinguish display conversion from the actual transaction currency.

## Future localization

Potential:
- languages
- localized dates
- localized currency display
- localized help content

Legal and financial content needs proper review.
