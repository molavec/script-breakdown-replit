import {
  MAX_UPLOAD_FILE_COUNT,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_TOTAL_SIZE_BYTES,
  StorageError,
  uploadFile,
} from '../utils/storage';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No files uploaded' });
  }

  const files = formData.filter(
    (field) => field.name === 'files' && Boolean(field.filename) && Boolean(field.data),
  );

  if (files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid files uploaded' });
  }

  if (files.length > MAX_UPLOAD_FILE_COUNT) {
    throw createError({
      statusCode: 413,
      statusMessage: `Too many files. A maximum of ${MAX_UPLOAD_FILE_COUNT} files can be uploaded at once`,
    });
  }

  const oversizedFile = files.find(
    (field) => field.data.byteLength > MAX_UPLOAD_FILE_SIZE_BYTES,
  );
  if (oversizedFile) {
    throw createError({
      statusCode: 413,
      statusMessage: `File "${oversizedFile.filename}" exceeds the maximum size of ${MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
    });
  }

  const totalSize = files.reduce((size, field) => size + field.data.byteLength, 0);
  if (totalSize > MAX_UPLOAD_TOTAL_SIZE_BYTES) {
    throw createError({
      statusCode: 413,
      statusMessage: `The upload exceeds the maximum request size of ${MAX_UPLOAD_TOTAL_SIZE_BYTES / (1024 * 1024)} MB`,
    });
  }

  try {
    const uploadedUrls: string[] = [];

    for (const field of files) {
      const url = await uploadFile(
        field.data,
        field.filename!,
        field.type || 'application/octet-stream',
      );
      uploadedUrls.push(url);
    }

    return { urls: uploadedUrls };
  } catch (error: unknown) {
    console.error('Error uploading file:', error);

    if (error instanceof StorageError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        cause: error,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error uploading file',
      cause: error,
    });
  }
});
