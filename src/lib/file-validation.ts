export interface FileValidationOptions {
  maxSize: number // in bytes
  allowedTypes: readonly string[]
  allowedExtensions?: readonly string[]
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

// MIME type to extension mapping
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z',
  'application/pdf': '.pdf',
}

// Magic bytes for file type detection
const MAGIC_BYTES: Record<string, Uint8Array> = {
  'image/jpeg': new Uint8Array([0xFF, 0xD8, 0xFF]),
  'image/png': new Uint8Array([0x89, 0x50, 0x4E, 0x47]),
  'image/webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]),
  'image/gif': new Uint8Array([0x47, 0x49, 0x46, 0x38]),
  'application/pdf': new Uint8Array([0x25, 0x50, 0x44, 0x46]),
  'application/zip': new Uint8Array([0x50, 0x4B, 0x03, 0x04]),
}

export async function validateFile(
  file: File,
  options: FileValidationOptions
): Promise<ValidationResult> {
  // Check file size
  if (file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
    }
  }

  // Check MIME type
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    }
  }

  // Check file extension if provided
  if (options.allowedExtensions) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!options.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File extension ${ext} is not allowed`
      }
    }
  }

  // Validate magic bytes for security (skipped for unknown / octet-stream types
  // since many legitimate digital-product formats don't have registered magic bytes).
  if (file.type && file.type !== 'application/octet-stream') {
    const magicValidation = await validateMagicBytes(file, file.type)
    if (!magicValidation.valid) {
      return magicValidation
    }
  }

  return { valid: true }
}

async function validateMagicBytes(file: File, expectedMime: string): Promise<ValidationResult> {
  const magicBytes = MAGIC_BYTES[expectedMime]

  if (!magicBytes) {
    // If we don't have magic bytes for this type, skip validation
    return { valid: true }
  }

  const buffer = await file.slice(0, magicBytes.length).arrayBuffer()
  const fileBytes = new Uint8Array(buffer)

  for (let i = 0; i < magicBytes.length; i++) {
    if (fileBytes[i] !== magicBytes[i]) {
      return {
        valid: false,
        error: 'File content does not match its declared type'
      }
    }
  }

  return { valid: true }
}

export function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? '.' + ext : ''
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename)
  const mimeTypes: Record<string, string> = {
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
  return mimeTypes[ext] || 'application/octet-stream'
}

// Predefined validation options
export const VALIDATION_OPTIONS = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  },
  banner: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  },
  productMedia: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/quicktime', 'video/webm'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.mov', '.webm']
  },
  productFile: {
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
    allowedTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/pdf',
      'application/octet-stream',
      'application/json',
      'text/plain',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/x-python',
      'application/x-csharp',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
      'image/svg+xml',
      'image/tiff',
      'image/bmp',
      'image/vnd.adobe.photoshop',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/x-wav',
      'audio/flac',
      'audio/aac',
      'audio/x-m4a',
      'model/gltf-binary',
      'model/gltf+json',
      'application/octet-stream',
    ],
    allowedExtensions: [
      // Archives
      '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
      // Documents
      '.pdf', '.txt', '.md', '.rtf', '.doc', '.docx', '.odt',
      // Spreadsheets / data
      '.csv', '.xls', '.xlsx', '.json', '.xml', '.yml', '.yaml',
      // Code / text source
      '.cs', '.cpp', '.c', '.h', '.hpp', '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.sass', '.less', '.java', '.kt', '.swift', '.go', '.rs', '.rb', '.php', '.sh', '.bat', '.lua', '.gd',
      // Images
      '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg', '.bmp', '.tiff', '.tif', '.ico', '.psd', '.ai', '.eps',
      // Video
      '.mp4', '.mov', '.webm', '.mkv', '.avi', '.flv', '.wmv', '.m4v',
      // Audio
      '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.opus',
      // 3D / game / engine
      '.fbx', '.obj', '.blend', '.gltf', '.glb', '.dae', '.stl', '.3ds', '.max', '.ma', '.mb', '.x', '.dxf',
      // Unity-specific
      '.unitypackage', '.unity', '.asset', '.prefab', '.mat', '.controller', '.shader', '.shadergraph', '.inputactions', '.uxml', '.uss', '.physicmaterial', '.physicmaterial2d', '.mixer', '.flare', '.anim', '.overridecontroller', '.mask', '.physicMaterial', '.playable',
      // Unreal
      '.uasset', '.umap', '.uproject', '.pak',
      // Godot
      '.tscn', '.tres', '.gd', '.godot',
      // VRChat / misc
      '.vrm', '.vrma',
      // Subtitles / extras
      '.srt', '.vtt', '.sub',
      // Other
      '.ttf', '.otf', '.woff', '.woff2',
    ]
  }
} as const
