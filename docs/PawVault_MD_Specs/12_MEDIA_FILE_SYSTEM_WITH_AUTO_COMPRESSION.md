# PawVault — Media & File System

## Purpose

Build one real, reusable media and file system for PawVault covering:

- User profile pictures
- Creator/store images and banners
- Product covers
- Product gallery images
- Product preview images
- Product videos
- Video posters/thumbnails
- Product downloadable files
- Product file versions
- Future commission attachments
- Future portfolio/community media

Use real storage, real database records, real processing, real access control, and real background jobs.

---

## 1. Core Architecture

```text
Upload
↓
Validate
↓
Create media/file record
↓
Store object
↓
Security checks
↓
Process / optimize
↓
Generate derivatives
↓
Verify output
↓
Attach to entity
↓
Publish when ready
```

Protected product files:

```text
Upload
↓
Quarantine
↓
Validate + scan
↓
Private storage
↓
Attach to product version
↓
Customer entitlement check
↓
Secure download
```

Do not create separate competing upload systems for profiles, products, commissions, or future features.

---

## 2. Object Storage

Use production-grade object storage such as an existing S3-compatible implementation, Cloudflare R2, Amazon S3, or another appropriate provider.

Inspect the existing PawVault code first and reuse the current storage architecture if one exists.

Large files must not be stored directly in the relational database.

Database stores:

```text
metadata
references
ownership
state
permissions
checksums
```

Object storage stores:

```text
actual file bytes
```

---

## 3. Public vs Private Assets

Every asset must have an explicit access class.

Examples:

```text
PUBLIC_MEDIA
PRIVATE_PRODUCT_FILE
PRIVATE_SUPPORT_ATTACHMENT
PRIVATE_MODERATION_EVIDENCE
PRIVATE_COMMISSION_FILE
```

Never expose private storage objects through accidental public URLs.

---

## 4. Profile Pictures

Users and creators can upload real profile pictures.

Flow:

```text
Select image
↓
Validate
↓
Upload
↓
Optimize
↓
Generate variants
↓
Save media record
↓
Set active profile picture
```

Support:

- Replacement
- Removal
- Default avatar
- Safe resizing
- Optimization
- Thumbnail generation
- Cache invalidation

Changing a profile picture must not require logout/login.

---

## 5. Creator Store Media

Support distinct assets for:

```text
Creator profile picture
Store image
Store banner
```

Do not silently merge them into one asset.

Creators control their own store media.

---

## 6. Product Media

Products should support:

```text
Product
├── Cover
├── Gallery
├── Preview media
└── Video
```

All media must use real database-backed records.

Do not hard-code production image/video URLs.

Gallery records should support suitable metadata:

```text
media_id
product_id
position
alt_text
caption
visibility
created_at
updated_at
```

---

## 7. Product Video

Support real uploaded product-preview videos.

Preferred flow:

```text
Original upload
↓
Validation
↓
Processing
↓
Playback derivative
↓
Poster frame
↓
Thumbnail
↓
READY
```

Store useful metadata:

```text
duration
width
height
file size
mime type
processing status
```

Large processing must happen asynchronously.

States:

```text
UPLOADING
PROCESSING
READY
FAILED
HIDDEN
DELETED
```

Never show a failed or incomplete video as READY.

---

## 8. Product Downloadable Files

Products may contain multiple files:

```text
Main package
Documentation
Bonus content
Optional files
```

Files must be tied to product versions where applicable.

Suggested metadata:

```text
id
owner_id
product_id
product_version_id
storage_key
original_filename
safe_filename
mime_type
extension
size_bytes
checksum
status
visibility
created_at
updated_at
```

Adapt names to the existing PawVault schema instead of creating duplicate models.

---

## 9. File Versioning

Creators must be able to release new product files without destroying historical records.

Example:

```text
Product v1.0
↓
Product v1.1
↓
Product v2.0
```

Each version can have its own file set.

New files should become:

```text
UPLOADED
↓
VALIDATED
↓
SCANNED
↓
PROCESSED
↓
READY
```

Never replace a production file with a partially uploaded file.

---

## 10. Checksums

Calculate cryptographic checksums for important files.

Use them for:

- Integrity
- Duplicate detection
- Upload verification
- Migration verification
- Version comparison

Never identify files by filename alone.

---

## 11. Secure Downloads

Customers must not receive permanent storage credentials.

Preferred:

```text
Customer
↓
Download request
↓
Authenticate
↓
Check order/license/entitlement
↓
Check product/file state
↓
Generate short-lived access
↓
Download
```

If signed URLs are used:

- Generate them server-side
- Keep them short-lived
- Generate only after entitlement verification
- Never expose storage credentials
- Never treat a signed URL as permanent ownership

---

## 12. Customer Entitlement Protection

Compression, optimization, storage migration, or media processing must never bypass:

- Orders
- Licenses
- Refunds
- Entitlements
- Product visibility
- Store suspension
- Access restrictions

An optimized derivative remains protected by the same entitlement rules.

---

## 13. Upload Sessions

Large uploads should preferably support resumable/multipart uploads.

```text
Create upload
↓
Upload chunks
↓
Complete
↓
Verify
↓
Finalize
```

Do not hold huge uploads entirely in normal HTTP request memory.

Centralize configurable limits for:

- Profile pictures
- Product images
- Product videos
- Product files
- Support attachments
- Future commission files

Enforce limits server-side.

---

## 14. File Validation

Do not trust browser-provided MIME types.

Validate actual content/signatures where practical.

Generate storage keys server-side.

Example:

```text
users/{user_id}/profile/{media_id}
products/{product_id}/media/{media_id}
products/{product_id}/files/{file_id}
```

Never use raw user-controlled filenames as storage paths.

---

# 15. AUTOMATIC COMPRESSION & OPTIMIZATION

PawVault must have an automatic compression/optimization pipeline for safe display media and video.

The purpose is to reduce:

- Storage usage
- Bandwidth
- Page weight
- Streaming cost
- Delivery time

without destroying creator content.

The central rule is:

> **Compress/optimize derivatives automatically. Never silently destroy or alter creator-owned source files.**

---

## 16. Compression by File Type

Different formats require different handling.

```text
Profile image
→ Resize + optimize

Product image
→ Resize + optimize

Product video
→ Transcode + optimize

ZIP/RAR/7Z
→ Validate + scan
→ Do NOT blindly recompress

.blend/.fbx/.unitypackage/.vrm
→ Preserve original

PSD/source project
→ Preserve original

PDF
→ Optional safe optimization
```

Do not run a generic compressor against every uploaded file.

---

## 17. Original Preservation

For display media:

```text
Creator upload
↓
Original preserved
↓
Optimized derivative generated
```

For creator-owned source/download files:

```text
Original source
↓
Preserve
```

Do not silently overwrite:

```text
.blend
.fbx
.psd
.unitypackage
.vrm
.zip
.rar
.7z
```

If PawVault offers an optimized download/package, it must be a separate verified derivative.

---

## 18. Automatic Image Compression

Automatically optimize display images where safe.

Possible operations:

- Resize oversized images
- Efficient encoding
- Quality optimization
- Metadata cleanup where appropriate
- Thumbnail generation
- Responsive variants

Do not excessively degrade creator images for negligible savings.

---

## 19. Profile Picture Optimization

Large profile uploads should automatically go through:

```text
Validate
↓
Resize
↓
Optimize
↓
Generate thumbnail
```

Do not serve huge originals for tiny avatar displays.

---

## 20. Product Image Optimization

Product covers and gallery images should generate appropriate variants.

Example:

```text
Original
├── Thumbnail
├── Small
├── Medium
└── Large
```

Use actual frontend requirements for dimensions.

---

## 21. Video Compression

Product videos should use an automatic processing pipeline:

```text
Original
↓
Quarantine
↓
Validate
↓
Transcode / optimize
↓
Playback derivative
↓
Poster
↓
Thumbnail
↓
Verify
↓
READY
```

Customers should not have to stream a massive original merely to watch a preview.

---

## 22. Video Original Preservation

Keep originals where useful for:

- Creator ownership
- Future reprocessing
- Codec upgrades
- Migration
- Replacement
- Evidence where required

Do not automatically replace the only original with a compressed copy.

---

## 23. Archives Must Not Be Blindly Recompressed

Do not automatically recompress:

```text
.zip
.rar
.7z
```

They are already compressed and may gain little or nothing.

Instead:

```text
Upload
↓
Validate archive
↓
Check dangerous paths
↓
Scan
↓
Store
```

---

## 24. 3D and Project Files

Treat these as untrusted creator files:

```text
.blend
.fbx
.vrm
.unitypackage
.vrca
.psd
```

Do not execute arbitrary uploaded code/content on production servers.

Future previews/conversions should run in isolated workers with restricted permissions.

---

# 25. Compression Job System

Large processing must use background jobs.

Jobs may include:

```text
IMAGE_OPTIMIZATION
VIDEO_TRANSCODE
THUMBNAIL_GENERATION
POSTER_GENERATION
ARCHIVE_SCAN
PACKAGE_GENERATION
```

States:

```text
QUEUED
PROCESSING
COMPLETED
FAILED
CANCELLED
```

Only mark COMPLETED when the output is actually verified.

---

## 26. Compression Idempotency

Retrying the same job must be safe.

Example:

```text
OPTIMIZE_MEDIA #123
OPTIMIZE_MEDIA #123
```

must not create uncontrolled duplicate derivatives.

Use deterministic job/output identities where practical.

---

## 27. Compression Failure

If processing fails:

```text
Job = FAILED
Original = SAFE
Product = NOT BROKEN
```

The creator's original must remain safe.

Allow controlled retry.

Do not delete the source merely because a derivative failed.

---

## 28. Compression Thresholds

Use centralized configurable settings rather than scattered magic numbers.

Examples:

```text
IMAGE_MAX_DIMENSION
IMAGE_QUALITY
VIDEO_MAX_PREVIEW_DIMENSION
VIDEO_TARGET_BITRATE
VIDEO_MAX_FILE_SIZE
```

Exact values should be chosen from actual infrastructure/frontend requirements.

---

## 29. Creator Controls

Future creator settings may include:

```text
Optimize preview media automatically
Generate optimized download package
Preserve original source files
```

A global optimization setting must never silently rewrite creator-owned source files.

---

## 30. Optional Optimized Download Packages

Future functionality may allow:

```text
Create optimized download package
```

Flow:

```text
Creator files
↓
Package builder
↓
Generated archive
↓
Verify expected file list
↓
Checksum
↓
Security scan
↓
READY
```

Example:

```text
Product_Name_v2_Optimized.zip
```

The generated package is separate from the creator's original files.

---

## 31. Package Integrity

Before an automatically generated package becomes downloadable:

- Verify archive integrity
- Verify expected file list
- Calculate checksum
- Run appropriate security checks
- Confirm generation completed
- Confirm product version
- Confirm storage object exists

Never publish partially generated packages.

---

## 32. Real Storage Savings

Where useful, record:

```text
Original size
Optimized size
Bytes saved
Compression ratio
```

Example:

```text
Original: 20 MB
Optimized: 8 MB
Saved: 12 MB
```

Only calculate these values from actual stored objects.

Never display fake savings.

---

## 33. Compression Progress

Where progress is available, expose real progress from the processing job.

Possible:

```text
Queued
Processing 42%
Completed
```

If accurate progress cannot be measured, use honest states rather than fake percentages.

Never fake upload or compression progress.

---

## 34. Resource Limits

Processing workers must have:

- CPU limits
- Memory limits
- Disk limits
- Timeout limits
- File-size limits
- Concurrent job limits

This protects PawVault against accidental or malicious resource exhaustion.

---

## 35. Isolated Processing

Where practical, processing should happen in isolated workers/containers.

Especially:

- Video processing
- Archive inspection
- Image conversion
- File conversion
- Future 3D previews

Workers should have minimum required permissions.

Never execute arbitrary creator code merely to process a file.

---

## 36. Temporary File Cleanup

Processing temporary files must be cleaned after completion/failure.

Do not leave temporary uploads or conversion copies indefinitely.

---

# 37. Malware Scanning

Customer-downloadable files should support:

```text
Upload
↓
Quarantine
↓
Security scan
↓
Safe
↓
READY
```

Do not claim a file was scanned unless real scanning is configured.

---

## 38. Archive Security

For:

```text
.zip
.rar
.7z
```

validate:

- Archive integrity
- Dangerous paths
- Path traversal
- Suspicious content
- Compression abuse
- Excessive expansion
- File count/size limits

Never extract an untrusted archive into an unrestricted application directory.

---

# 39. Public Media CDN

Public media may use a CDN:

```text
Object storage
↓
CDN
↓
User
```

Use versioned URLs or controlled cache invalidation when replacing assets.

---

# 40. Private Media

Private product files, moderation evidence, support attachments, and similar assets must use controlled access.

Do not put private files into a public CDN bucket.

---

# 41. Media Health

Staff/system health checks should detect:

- Missing objects
- Broken references
- Failed processing
- Stuck uploads
- Failed thumbnails
- Failed videos
- Orphaned files
- Storage errors
- Repeated processing failures

---

# 42. Orphan Cleanup

Before deleting storage objects:

```text
Check database references
↓
Check processing state
↓
Check product/version references
↓
Check retention requirements
↓
Grace period
↓
Purge
```

Never purge an object merely because it temporarily lacks a visible UI reference.

---

# 43. Deletion

Use safe states where appropriate:

```text
ACTIVE
↓
SOFT_DELETED
↓
PURGE_ELIGIBLE
↓
PURGED
```

Do not immediately destroy files required for:

- Orders
- Licenses
- Refund disputes
- Moderation evidence
- Legal retention
- Audit history

---

# 44. Product Publishing Readiness

A product should only publish when required media/files are ready.

```text
Draft
↓
Required media ready
↓
Required files ready
↓
Security checks passed
↓
Validation passed
↓
Publish
```

A product must not become live with broken required media.

---

# 45. Creator Ownership Boundary

Creators own/control their own stores, products, files, artwork, pricing, descriptions, and creator content subject to PawVault's Terms and platform rules.

PawVault may:

- Review reports
- Process files
- Deliver entitled files
- Restrict content under platform rules
- Hide/suspend products where authorized
- Suspend/ban stores or accounts where authorized
- Preserve moderation evidence
- Handle legal/IP requests

PawVault must not casually:

- Change creator prices
- Make paid products free
- Replace creator source files
- Transfer store ownership
- Change creator payout settings
- Publish private creator content
- Claim creator content
- Delete creator-owned source material as a normal moderation action

A moderation action is not an ownership transfer.

---

# 46. Moderator Access

Moderators may inspect reported media/files only through explicit permissions.

Suggested permissions:

```text
MODERATION_MEDIA_VIEW
MODERATION_FILE_METADATA_VIEW
MODERATION_EVIDENCE_VIEW
MODERATION_MEDIA_ACTION
```

A moderator viewing creator content does not gain ownership.

Do not grant a generic:

```text
MANAGE_EVERYTHING
```

permission.

---

# 47. Support Access

Support gets only the file access required for a support case.

Do not give Support blanket access to every private product file.

---

# 48. Audit Log

Record important operations:

```text
Profile image changed
Product media uploaded
Product media replaced
Product video processed
Product file uploaded
Product version published
File hidden
File restored
Evidence accessed
File purged
Compression job created
Compression job retried
Generated package published
```

Record:

```text
actor
target
timestamp
action
result
reference
```

Avoid unnecessary sensitive data.

---

# 49. API

Reuse PawVault's existing authentication and API architecture.

Possible operations:

```text
Upload initialization
Upload completion
Media metadata
Media replacement
Media deletion
Media ordering
Profile picture update
Product media management
Product file management
Secure download
Processing status
Compression status
```

Do not create a second authentication system.

---

# 50. Authorization

Every protected operation checks:

```text
Authenticated user
+
Current permission
+
Ownership/relationship
+
Resource state
```

Example:

```text
Creator uploads product file
↓
Authenticated
↓
Creator capability
↓
Owns/controls product
↓
Allowed
```

---

# 51. Global No-Logout Rule

This system follows PawVault's global session synchronization requirement.

If a user receives or loses a normal permission/capability:

```text
Permission changes
↓
Existing session synchronizes
↓
Access changes immediately
```

Do not require:

```text
Sign out
↓
Sign in
```

This applies to:

- Creator tools
- Product management
- Media management
- File management
- Moderation
- Support
- Admin
- Analytics
- Teams
- Commissions
- Future features

Only genuine security/session invalidation events may require re-authentication.

---

# 52. Notifications

Media events may trigger in-app/email notifications:

```text
Product video ready
Product file rejected
Product update published
Upload failed
Compression completed
Compression failed
```

Email is only a notification layer.

The database/application remains authoritative.

---

# 53. No Fake Data

Never ship fake:

```text
Image URLs
Video URLs
File sizes
Upload progress
Compression progress
Storage savings
Processing status
Download status
```

If something is not implemented, show an honest state.

---

# 54. No Static Duplication

Do not hard-code media independently across:

- Marketplace
- Product pages
- Creator pages
- Search
- Profiles
- Storefronts

All consumers should use authoritative media records.

---

# 55. Future Reuse

The same media system should eventually support:

```text
Creator portfolios
Commission attachments
Commission deliveries
Community posts
Creator posts
Product update media
Support attachments
Moderation evidence
```

Do not rebuild storage for each future feature.

---

# 56. Test Matrix

## Profile

- Upload valid image
- Reject invalid file
- Optimize
- Generate variants
- Replace
- Remove
- Verify cache
- Verify no logout/login

## Product media

- Upload cover
- Upload gallery
- Reorder
- Upload video
- Process video
- Generate poster
- Generate thumbnail
- Replace media
- Publish

## Product files

- Upload archive
- Validate
- Scan
- Attach to version
- Publish
- Purchase
- Verify entitlement
- Download
- Verify refund/revocation behavior

## Compression

- Oversized image
- Large video
- Small image
- ZIP
- RAR
- 7Z
- BLEND
- FBX
- Generated package
- Failed compression
- Retry
- Duplicate job
- Verify original preservation
- Verify real savings
- Verify output integrity

---

# 57. Security Tests

Attempt to:

- Download another customer's protected file
- Read another creator's private file
- Replace another creator's product media
- Delete another creator's file
- Trigger staff-only processing
- Access private media using a guessed URL
- Bypass entitlement through an optimized derivative
- Download a file after entitlement is revoked
- Extract a malicious archive outside its intended directory
- Exhaust worker resources with oversized input

All unauthorized attempts must fail.

---

# 58. Failure Tests

Storage failure:

Expected:

- No false READY state
- Upload can retry
- Business state remains consistent
- Failure is recorded

Processing failure:

Expected:

```text
FAILED
```

not:

```text
READY
```

Original remains safe.

---

# 59. Definition of Done

- [ ] Real object storage
- [ ] Central media system
- [ ] Central product-file system
- [ ] Profile picture uploads
- [ ] Store images/banners
- [ ] Product covers
- [ ] Product gallery
- [ ] Product videos
- [ ] Video processing
- [ ] Posters/thumbnails
- [ ] Product files
- [ ] Product file versions
- [ ] Secure downloads
- [ ] Entitlement checks
- [ ] Checksums
- [ ] Upload limits
- [ ] Content validation
- [ ] Secure storage keys
- [ ] Quarantine/scanning architecture
- [ ] Archive validation
- [ ] Public/private separation
- [ ] CDN strategy
- [ ] Cache invalidation
- [ ] Audit logs
- [ ] Scoped staff permissions
- [ ] Creator ownership boundaries
- [ ] Upload retries
- [ ] Processing retries
- [ ] Idempotency
- [ ] Orphan cleanup
- [ ] Storage health
- [ ] Automatic image compression
- [ ] Automatic video optimization
- [ ] Original preservation
- [ ] Optional optimized packages
- [ ] Compression job tracking
- [ ] Compression resource limits
- [ ] Compression failure recovery
- [ ] Real compression savings
- [ ] Real processing progress
- [ ] No fake upload progress
- [ ] No fake compression progress
- [ ] No data loss
- [ ] No forced logout/login

---

# 60. Kilo Implementation Rule

Before changing code:

1. Inspect the existing database.
2. Inspect existing product/media/file APIs.
3. Inspect the current storage implementation.
4. Inspect authentication/session synchronization.
5. Inspect permissions.
6. Inspect products/orders/licenses/refunds.
7. Inspect notifications.
8. Inspect existing background-job infrastructure.
9. Reuse existing infrastructure.
10. Upgrade partial implementations instead of creating duplicates.

Do not create a second competing:

- Upload system
- Storage system
- Media system
- Compression system
- Download system
- Authentication system

---

# 61. Do Not Break Existing Systems

This implementation must not break:

- Authentication
- Session synchronization
- Creator profiles
- Creator stores
- Products
- Product publishing
- Checkout
- Orders
- Licenses
- Downloads
- Refunds
- Notifications
- Support
- Moderation
- Creator ownership

---

# 62. Final Architecture

```text
                         UPLOAD
                           │
                           ▼
                    Upload Session
                           │
                           ▼
                       Validate
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
             Media                 Product File
                │                     │
                ▼                     ▼
        Optimize / Process        Quarantine
                │                     │
                ▼                     ▼
           Derivatives              Scan
                │                     │
                ▼                     ▼
          Verify / READY            READY
                │                     │
                └──────────┬──────────┘
                           ▼
                    Database Record
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
             Profile    Product    Entitlement
              Media      Media        Check
                                      │
                                      ▼
                               Secure Download
```

---

# 63. Final Principle

> **PawVault should treat uploaded media and product files as real platform assets, with real storage, real ownership, real processing, real compression, real permissions, and real access control.**

Profile pictures should be real.

Product photos should be real.

Product videos should be real.

Product files should be real.

Compression should be automatic where safe.

Original creator content must remain protected.

> **Compress derivatives automatically. Never silently destroy creator-owned source files.**

The server remains authoritative.

Creators control their own content.

Customers receive files through actual entitlements.

Moderators receive only scoped access.

And ordinary permission/media changes take effect in the existing session without forcing users to sign out and back in.
