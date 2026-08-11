import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromPDF(file) {
  try {
    // Convert the uploaded file into an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Convert ArrayBuffer into Uint8Array
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load the PDF
    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

    let fullText = "";

    // Read every page
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");

      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Unable to extract text from this PDF.");
  }
}