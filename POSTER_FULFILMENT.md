# Poster fulfilment (sandbox)

The webhook persists payment before invoking fulfilPaidPoster. The provider adapter is intentionally absent, so no external submission occurs even if PRODIGI_ENABLE_FULFILMENT=true.

## States
- paid: durable order awaiting claim.
- submitting: exclusive claim; never automatically reset, even after a crash.
- submitted: provider ID stored.
- submission_rejected: confirmed rejection only; review before retry.
- needs_reconciliation: ambiguous outcome; find provider order by merchant reference before any retry.

The stable merchant reference is the Stripe checkout session ID. Verify provider reference length and lookup semantics before implementing the adapter. A merchant reference alone is not proof of provider idempotency.

## Activation gates
- Verify artwork access and exact sandbox order API request/response contract.
- Validate supported variant, complete address, and sandbox credentials before claiming.
- Implement provider adapter with timeout and conservative classification of errors.
- Implement authenticated reconciliation and recovery for stuck submitting rows, including database failure after provider acceptance.
- Implement authenticated provider status retrieval or verified callbacks; never trust unsigned callback status directly.
- Test concurrent claims, rejected requests, ambiguous responses, accepted response followed by DB failure, and replay.
- Add a durable worker or scheduled reconciliation for unattended processing.
- Only then enable the sandbox flag. Production requires separate database, credentials, explicit migration and security review.

No print orders are submitted by this change.
