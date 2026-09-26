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
  subPath?: string
}

export interface UploadResult {
  url: string
  key: string
  size: number
  contentType: string
}

export function getBucket(): string | null {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
  if (!bucket) {
    console.warn('SUPABASE_STORAGE_BUCKET not configured. Storage operations will be disabled.')
    return null
  }
  return bucket
}

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn('Supabase Storage configuration missing. Storage operations will be disabled.')
    return null
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
    .replace(/^-|-$/, '')
    .slice(0, 60)
  return ext ? `${sanitized}.${ext}` : sanitized
}

function safeSubPath(sub: string | undefined): string {
  if (!sub) return ""
  return sub
    .replace(/\\/g, "/")
    .split("/")
    .map((p) =>
      p
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/, "")
    )
    .filter(Boolean)
    .join("/")
}

function generateKey(options: StorageOptions, filename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const safeName = sanitizeFilename(filename)
  const sub = safeSubPath(options.subPath)
  const tail = sub ? `${sub}/${timestamp}-${random}-${safeName}` : `${timestamp}-${random}-${safeName}`

  if (options.folder === 'avatars' && options.userId) {
    return `avatars/${options.userId}/${tail}`
  }

  if (options.folder === 'stores' && options.userId) {
    return `stores/${options.userId}/${tail}`
  }

  if (options.folder === 'products' && options.productId) {
    if (options.contentType?.startsWith('video/')) {
      return `products/${options.productId}/files/${tail}`
    }
    return `products/${options.productId}/images/${tail}`
  }

  if (options.folder === 'files' && options.productId) {
    return `products/${options.productId}/files/${tail}`
  }

  return `${options.folder}/${tail}`
}

export async function uploadFile(
  file: File,
  options: StorageOptions,
): Promise<UploadResult | null> {
  if (options.validation) {
    const validation = await validateFile(file, VALIDATION_OPTIONS[options.validation])
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed')
    }
  }

  const supabase = getSupabaseClient()
  if (!supabase) return null

  const bucket = getBucket()
  if (!bucket) return null

  const key = generateKey(options, file.name)

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(key, file, {
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
      return null
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(key)

    const url = publicUrlData.publicUrl

    try {
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
    } catch {
      console.error("Failed to create audit log for file upload")
    }

    return {
      url,
      key,
      size: file.size,
      contentType: options.contentType || file.type || 'application/octet-stream',
    }
  } catch (error) {
    console.error('Supabase Storage upload failed:', error)
    return null
  }
}

export async function deleteFile(key: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const bucket = getBucket()

  if (!supabase || !bucket) return false

  try {
    const { error } = await supabase.storage.from(bucket).remove([key])

    if (error) {
      console.error('Supabase Storage delete error:', error.message)
      return false
    }
    return true
  } catch (error) {
    console.error('Supabase Storage delete failed:', error)
    return false
  }
}

export async function saveFileRecord(
  userId: string | undefined,
  productId: string,
  uploadResult: UploadResult,
  filename: string,
  extra?: { version?: string; platform?: string; folder?: string },
) {
  return prisma.productFile.create({
    data: {
      productId,
      filename,
      url: uploadResult.url,
      size: uploadResult.size,
      version: extra?.version,
      platform: extra?.platform,
      folder: extra?.folder ?? "",
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
