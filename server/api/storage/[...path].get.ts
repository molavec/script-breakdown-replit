import {
  downloadFile,
  getMimeTypeForObjectName,
  isStoredObjectName,
  StorageError,
} from '../../utils/storage';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const objectName = getRouterParam(event, 'path');

  if (!objectName || !isStoredObjectName(objectName, user.id)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Storage object not found',
    });
  }

  try {
    const fileBuffer = await downloadFile(objectName);

    setHeader(event, 'Content-Type', getMimeTypeForObjectName(objectName));
    setHeader(event, 'Content-Length', fileBuffer.byteLength);
    setHeader(event, 'Content-Disposition', 'inline');
    setHeader(event, 'X-Content-Type-Options', 'nosniff');
    setHeader(event, 'Cache-Control', 'private, no-store');

    return fileBuffer;
  } catch (error: unknown) {
    console.error(`Error reading storage object ${objectName}:`, error);

    if (error instanceof StorageError) {
      const statusCode = error.statusCode === 404 ? 404 : error.statusCode;
      throw createError({
        statusCode,
        statusMessage: statusCode === 404 ? 'Storage object not found' : error.message,
        cause: error,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error reading storage object',
      cause: error,
    });
  }
});