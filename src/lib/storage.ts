import { createClient } from '@supabase/supabase-js'
import { validateFile, VALIDATION_OPTIONS } from './file-validation'
import { createAuditLog, AuditActions } from './audit-logger'
import { prisma } from './prisma'

export type StorageProvider = 'supabase'

export interface StorageOptions {
  folder: 'avatars' | 'products' | 'stores' | 'files'
  userId?: string
  productId?: string
  storeId?: string
  validation?: keyof typeof VALIDATION_OPTIONS
  contentType?: string
}

export interface UploadResult {
  url: string
  key: string
  size: number
  contentType: string
}

export function getBucket(): string {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
  if (!bucket) {
    throw new Error(
      'Missing SUPABASE_STORAGE_BUCKET. Set it in your environment variables. See .env.example.',
    )
  }
  return bucket
}

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase Storage configuration. Required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. See .env.example.',
    )
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function sanitizeFilename(filename: string): string {
  const ext = filename.includes('.') ? filename.split('.').pop() : ''
  const baseName = filename.includes('.') 
    ? filename.slice(0, filename.lastIndexOf('.'))
    : filename
  const sanitized = baseName
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return ext ? `${sanitized}.${ext}` : sanitized
}

function generateKey(options: StorageOptions, filename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const safeName = sanitizeFilename(filename)
  const filePart = `${timestamp}-${random}-${safeName}`

  if (options.folder === 'avatars' && options.userId) {
    return `avatars/${options.userId}/${filePart}`
  }

  if (options.folder === 'stores' && options.userId) {
    return `stores/${options.userId}/${filePart}`
  }

  if (options.folder === 'products' && options.productId) {
    if (options.contentType?.startsWith('video/')) {
      return `products/${options.productId}/files/${filePart}`
    }
    return `products/${options.productId}/images/${filePart}`
  }

  if (options.folder === 'files' && options.productId) {
    return `products/${options.productId}/files/${filePart}`
  }

  return `${options.folder}/${filePart}`
}

export async function uploadFile(
  file: File,
  options: StorageOptions,
): Promise<UploadResult> {
  if (options.validation) {
    const validation = await validateFile(file, VALIDATION_OPTIONS[options.validation])
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed')
    }
  }

  const supabase = getSupabaseClient()
  const bucket = getBucket()
  const key = generateKey(options, file.name)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, buffer, {
      contentType: options.contentType || file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) {
    console.error('Supabase Storage upload error:', {
      message: error.message,
      statusCode: (error as any).statusCode,
      bucket,
      key,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    })
    throw new Error(`Supabase Storage upload failed: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(key)

  const url = publicUrlData.publicUrl

  await createAuditLog({
    userId: options.userId,
    action: AuditActions.FILE_UPLOADED,
    details: {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      key,
      bucket,
      folder: options.folder,
      provider: 'supabase',
    },
  })

  return {
    url,
    key,
    size: buffer.length,
    contentType: options.contentType || file.type || 'application/octet-stream',
  }
}

export async function deleteFile(key: string): Promise<void> {
  const supabase = getSupabaseClient()
  const bucket = getBucket()

  const { error } = await supabase.storage.from(bucket).remove([key])

  if (error) {
    throw new Error(`Supabase Storage delete failed: ${error.message}`)
  }
}

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
