import { validateFile, VALIDATION_OPTIONS } from './file-validation'
import { createAuditLog, AuditActions } from './audit-logger'
import { prisma } from './prisma'
import crypto from 'crypto'

export interface StorageOptions {
  folder: string
  userId?: string
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

// Get storage configuration from environment
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

// Generate a unique key for the file
function generateKey(folder: string, filename: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  const ext = filename.split('.').pop()
  const baseName = filename.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9-_]/g, '')
  return `${folder}/${timestamp}-${random}-${baseName}.${ext}`
}

// Local storage implementation (for development)
async function uploadToLocal(
  file: File,
  key: string
): Promise<UploadResult> {
  // In production, this would upload to S3 or R2
  // For now, we'll return a mock URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = `${baseUrl}/uploads/${key}`
  
  return {
    url,
    key,
    size: file.size,
    contentType: file.type,
  }
}

// S3 storage implementation
async function uploadToS3(
  file: File,
  key: string,
  config: StorageConfig
): Promise<UploadResult> {
  // TODO: Implement S3 upload using AWS SDK
  // This is a placeholder for the actual implementation
  const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`
  
  return {
    url,
    key,
    size: file.size,
    contentType: file.type,
  }
}

// Cloudflare R2 storage implementation
async function uploadToR2(
  file: File,
  key: string,
  config: StorageConfig
): Promise<UploadResult> {
  // TODO: Implement R2 upload using AWS S3 compatible API
  const url = `https://${config.bucket}.r2.cloudflarestorage.com/${key}`
  
  return {
    url,
    key,
    size: file.size,
    contentType: file.type,
  }
}

// Main upload function
export async function uploadFile(
  file: File,
  options: StorageOptions,
  validationOptions?: keyof typeof VALIDATION_OPTIONS
): Promise<UploadResult> {
  // Validate file if validation options provided
  if (validationOptions) {
    const validation = await validateFile(file, VALIDATION_OPTIONS[validationOptions])
    if (!validation.valid) {
      throw new Error(validation.error)
    }
  }

  const config = getStorageConfig()
  const key = generateKey(options.folder, file.name)

  let result: UploadResult

  switch (config.provider) {
    case 's3':
      result = await uploadToS3(file, key, config)
      break
    case 'r2':
      result = await uploadToR2(file, key, config)
      break
    case 'local':
    default:
      result = await uploadToLocal(file, key)
      break
  }

  // Log the upload
  await createAuditLog({
    userId: options.userId,
    action: AuditActions.SECURITY_FILE_UPLOAD_REJECTED,
    details: {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      key,
      folder: options.folder,
    },
  })

  return result
}

// Delete file from storage
export async function deleteFile(key: string): Promise<void> {
  const config = getStorageConfig()

  // TODO: Implement deletion based on provider
  // For now, this is a placeholder
  console.log(`Deleting file: ${key} from ${config.provider}`)
}

// Generate a signed URL for temporary access
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const config = getStorageConfig()

  // TODO: Implement signed URL generation based on provider
  // For now, return a mock URL
  if (config.provider === 'local') {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/uploads/${key}`
  }

  return key
}

// Save file record to database
export async function saveFileRecord(
  userId: string,
  productId: string,
  uploadResult: UploadResult,
  filename: string
) {
  await prisma.productFile.create({
    data: {
      productId,
      filename,
      url: uploadResult.url,
      size: uploadResult.size,
    },
  })
}

// Save media record to database
export async function saveMediaRecord(
  productId: string,
  uploadResult: UploadResult,
  type: 'image' | 'video',
  isThumbnail: boolean = false,
  order: number = 0
) {
  await prisma.productMedia.create({
    data: {
      productId,
      type,
      url: uploadResult.url,
      isThumbnail,
      order,
    },
  })
}
