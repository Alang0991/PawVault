import { validateFile, VALIDATION_OPTIONS } from './file-validation'
import { createAuditLog, AuditActions } from './audit-logger'
import { prisma } from './prisma'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export interface StorageOptions {
  folder: string
  userId?: string
  validation?: keyof typeof VALIDATION_OPTIONS
}

export interface UploadResult {
  url: string
  key: string
  size: number
  contentType: string
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'r2'
  bucket?: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
}

/**
 * Storage configuration.
 *
 * By default uploads are written to the local `public/uploads` directory and
 * served statically from `/uploads/...`. This works in development and on a
 * long-running Node server.
 *
 * For serverless / Vercel deployments the filesystem is read-only at runtime,
 * so configure an object store instead:
 *   STORAGE_PROVIDER=s3        (or "r2")
 *   STORAGE_BUCKET=my-bucket
 *   STORAGE_REGION=us-east-1
 *   STORAGE_ACCESS_KEY_ID=...
 *   STORAGE_SECRET_ACCESS_KEY=...
 *   STORAGE_PUBLIC_BASE_URL=https://cdn.example.com
 * (S3/R2 upload requires the AWS SDK to be installed; local disk is the
 *  zero-dependency default.)
 */
function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3' | 'r2'
  return {
    provider,
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  }
}

function generateKey(folder: string, filename: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  const ext = filename.includes('.') ? filename.split('.').pop() : 'bin'
  const baseName = filename
    .replace(`.${ext}`, '')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 40)
  return `${folder}/${timestamp}-${random}-${baseName}.${ext}`
}

function getBaseUrl(request?: Request): string {
  if (process.env.STORAGE_PUBLIC_BASE_URL) return process.env.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, '')
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  if (request) return new URL(request.url).origin
  return 'http://localhost:3000'
}

async function uploadToLocal(
  buffer: Buffer,
  key: string,
  request?: Request,
): Promise<UploadResult> {
  const fullPath = path.join(process.cwd(), 'public', 'uploads', key)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, buffer)
  const url = `${getBaseUrl(request)}/uploads/${key}`
  const dotExt = key.includes('.') ? `.${key.split('.').pop()}` : ''
  return {
    url,
    key,
    size: buffer.length,
    contentType: mimeFromExt(dotExt),
  }
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
    '.pdf': 'application/pdf',
  }
  return map[ext.toLowerCase()] || 'application/octet-stream'
}

/**
 * Upload a file (web File/Blob from a multipart form) to the configured store.
 * Returns a real, reachable URL and persists an audit log entry.
 */
export async function uploadFile(
  file: File,
  options: StorageOptions,
  request?: Request,
): Promise<UploadResult> {
  if (options.validation) {
    const validation = await validateFile(file, VALIDATION_OPTIONS[options.validation])
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed')
    }
  }

  const config = getStorageConfig()
  const key = generateKey(options.folder, file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  if (config.provider === 'local') {
    if (process.env.VERCEL) {
      throw new Error(
        'Local file uploads are not supported on Vercel. Set STORAGE_PROVIDER=s3 (or r2) and configure STORAGE_BUCKET, STORAGE_REGION, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY. See .env.example for required env vars.',
      )
    }
    const result = await uploadToLocal(buffer, key, request)
    await createAuditLog({
      userId: options.userId,
      action: AuditActions.SECURITY_FILE_UPLOAD_REJECTED,
      details: {
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        key,
        folder: options.folder,
        provider: 'local',
      },
    })
    return result
  }

  // s3 / r2 are configured in env but require an S3-compatible SDK to write.
  throw new Error(
    `Storage provider "${config.provider}" is not implemented. Set STORAGE_PROVIDER=local for filesystem uploads, or install and configure an S3-compatible client with STORAGE_BUCKET/STORAGE_REGION/STORAGE_ACCESS_KEY_ID/STORAGE_SECRET_ACCESS_KEY.`,
  )
}

/** Delete a stored file (best-effort; safe if missing). */
export async function deleteFile(key: string): Promise<void> {
  const config = getStorageConfig()
  if (config.provider !== 'local') return
  try {
    await fs.unlink(path.join(process.cwd(), 'public', 'uploads', key))
  } catch {
    // ignore missing file
  }
}

/** Save a product file record to the database. */
export async function saveFileRecord(
  userId: string | undefined,
  productId: string,
  uploadResult: UploadResult,
  filename: string,
  extra?: { version?: string; platform?: string },
) {
  return prisma.productFile.create({
    data: {
      productId,
      filename,
      url: uploadResult.url,
      size: uploadResult.size,
      version: extra?.version,
      platform: extra?.platform,
    },
  })
}

/** Save a product media record to the database. */
export async function saveMediaRecord(
  productId: string,
  uploadResult: UploadResult,
  type: 'image' | 'video',
  isThumbnail: boolean = false,
  order: number = 0,
) {
  return prisma.productMedia.create({
    data: {
      productId,
      type,
      url: uploadResult.url,
      isThumbnail,
      order,
    },
  })
}
