import { randomUUID } from 'node:crypto';
import { Client } from '@replit/object-storage';

/**
 * Error normalizado para que las rutas puedan devolver un estado HTTP útil
 * sin exponer detalles de configuración del SDK al cliente.
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

const MIME_TYPES: Record<string, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

interface SupportedImageType {
  mimeType: string;
  canonicalExtension: string;
  extensions: string[];
}

const SUPPORTED_IMAGE_TYPES: SupportedImageType[] = [
  { mimeType: 'image/png', canonicalExtension: 'png', extensions: ['png'] },
  { mimeType: 'image/jpeg', canonicalExtension: 'jpg', extensions: ['jpg', 'jpeg'] },
  { mimeType: 'image/gif', canonicalExtension: 'gif', extensions: ['gif'] },
  { mimeType: 'image/webp', canonicalExtension: 'webp', extensions: ['webp'] },
];

/**
 * Upload limits shared by the upload endpoint and the storage primitive.
 * Keeping these values here prevents callers from bypassing the per-file cap.
 */
export const MAX_UPLOAD_FILE_COUNT = 10;
export const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_TOTAL_SIZE_BYTES = 50 * 1024 * 1024;

const detectImageType = (fileBuffer: Buffer): SupportedImageType | null => {
  const isPng = fileBuffer.length >= 8
    && fileBuffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (isPng) return SUPPORTED_IMAGE_TYPES[0]!;

  const isJpeg = fileBuffer.length >= 3
    && fileBuffer[0] === 0xff
    && fileBuffer[1] === 0xd8
    && fileBuffer[2] === 0xff;
  if (isJpeg) return SUPPORTED_IMAGE_TYPES[1]!;

  const gifHeader = fileBuffer.subarray(0, 6).toString('ascii');
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
    return SUPPORTED_IMAGE_TYPES[2]!;
  }

  const isWebp = fileBuffer.length >= 12
    && fileBuffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && fileBuffer.subarray(8, 12).toString('ascii') === 'WEBP';
  if (isWebp) return SUPPORTED_IMAGE_TYPES[3]!;

  return null;
};

const getSafeExtension = (
  originalName: string,
  imageType: SupportedImageType,
): string => {
  const extension = originalName.match(/\.([a-z0-9]{1,12})$/i)?.[1]?.toLowerCase();
  if (extension && imageType.extensions.includes(extension)) {
    return extension;
  }

  return imageType.canonicalExtension;
};

const getStorageErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return 'Replit App Storage request failed';
};

const getStorageErrorStatus = (error: unknown, fallback: number): number => {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    if (typeof statusCode === 'number' && statusCode >= 400 && statusCode <= 599) {
      return statusCode;
    }
  }

  return fallback;
};

const createStorageClient = (): Client => {
  // Sin opciones, el SDK resuelve el bucket por defecto definido en .replit.
  return new Client();
};

export const getMimeTypeForObjectName = (objectName: string): string => {
  const extension = objectName.split('.').pop()?.toLowerCase() || 'bin';
  return MIME_TYPES[extension] || 'application/octet-stream';
};

const userObjectPrefix = (userId: string) =>
  `uploads/${Buffer.from(userId, 'utf8').toString('base64url')}/`;

export const isStoredObjectName = (objectName: string, userId: string): boolean =>
  objectName.startsWith(userObjectPrefix(userId))
  && /^uploads\/[^/]+\/[a-f0-9-]{36}\.(?:png|jpe?g|gif|webp)$/i.test(objectName);

export async function uploadFile(
  fileBuffer: Buffer,
  originalName: string,
  _mimeType: string,
  userId: string,
): Promise<string> {
  if (fileBuffer.byteLength > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new StorageError(
      `File "${originalName}" exceeds the maximum size of ${MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
      413,
    );
  }

  const imageType = detectImageType(fileBuffer);
  if (!imageType) {
    throw new StorageError(
      'Unsupported file type. Only PNG, JPEG, GIF, and WebP images are allowed',
      415,
    );
  }

  const extension = getSafeExtension(originalName, imageType);
  const objectName = `${userObjectPrefix(userId)}${randomUUID()}.${extension}`;

  try {
    const result = await createStorageClient().uploadFromBytes(objectName, fileBuffer);
    if (!result.ok) {
      throw new StorageError(
        `Unable to upload ${originalName}: ${getStorageErrorMessage(result.error)}`,
        getStorageErrorStatus(result.error, 502),
      );
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      'Replit App Storage is not configured or unavailable',
      503,
    );
  }

  return `/api/storage/${objectName}`;
}

export async function downloadFile(objectName: string): Promise<Buffer> {
  try {
    const result = await createStorageClient().downloadAsBytes(objectName);
    if (!result.ok) {
      throw new StorageError(
        `Unable to read stored object: ${getStorageErrorMessage(result.error)}`,
        getStorageErrorStatus(result.error, 502),
      );
    }

    const [buffer] = result.value;
    if (!buffer) {
      throw new StorageError('Stored object was empty or unreadable', 502);
    }

    return buffer;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      'Replit App Storage is not configured or unavailable',
      503,
    );
  }
}
