import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma'

export type StorageProvider = 'supabase'

export interface StorageOptions {
  folder: string
  userId?: string
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

function generateKey(folder: string, filename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 10)
  const ext = filename.includes('.') ? filename.split('.').pop() : 'bin'
  const baseName = filename
    .replace(`.${ext}`, '')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 40)
  return `${folder}/${timestamp}-${random}-${baseName}.${ext}`
}

export async function uploadFile(
  file: File,
  options: StorageOptions,
): Promise<UploadResult> {
  const supabase = getSupabaseClient()
  const bucket = getBucket()
  const key = generateKey(options.folder, file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, buffer, {
      contentType: options.contentType || file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(key)

  const url = publicUrlData.publicUrl

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
