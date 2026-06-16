export const CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const CV_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const CV_MAX_BYTES = 5 * 1024 * 1024;

export type UploadedFile = {
  name: string;
  mime: string;
  data: string;
};

export function isAllowedCvFile(file: File): boolean {
  return (
    CV_MIME_TYPES.includes(file.type as (typeof CV_MIME_TYPES)[number]) ||
    /\.(pdf|doc|docx)$/i.test(file.name)
  );
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export async function fileToUploaded(file: File): Promise<UploadedFile> {
  if (!isAllowedCvFile(file)) {
    throw new Error("Please upload a PDF or Word document (.pdf, .doc, .docx)");
  }
  if (file.size > CV_MAX_BYTES) {
    throw new Error("File must be under 5MB");
  }
  const data = await readFileAsDataUrl(file);
  return {
    name: file.name,
    mime: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/msword"),
    data,
  };
}
