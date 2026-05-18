import { Buffer } from 'node:buffer';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const maxPreviewLength = 120_000;

interface ImportFile {
  originalname: string;
  buffer: Buffer;
}

export async function extractImportText(file: ImportFile) {
  const extension = file.originalname.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return trimContent(file.buffer.toString('utf8'));
  }

  if (extension === 'xlsx') {
    return extractXlsxText(file.buffer);
  }

  if (extension === 'docx') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return trimContent(result.value);
  }

  throw new Error('UNSUPPORTED_FILE_TYPE');
}

function extractXlsxText(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const rows = workbook.SheetNames.flatMap((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return [];
    }

    const csv = XLSX.utils.sheet_to_csv(sheet);
    return [`Sheet: ${sheetName}`, csv];
  });

  return trimContent(rows.join('\n\n'));
}

function trimContent(content: string) {
  return content.trim().slice(0, maxPreviewLength);
}
