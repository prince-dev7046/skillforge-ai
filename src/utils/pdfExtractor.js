import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const uint8Array = new Uint8Array(arrayBuffer);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

    let fullText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const textContent = await page.getTextContent();

      const items = textContent.items;

      let lines = [];
      let currentLine = [];
      let lastY = null;

      for (const item of items) {
        const text = item.str.trim();

        if (!text) continue;

        const currentY = item.transform[5];

        // Detect a new line
        if (
          lastY !== null &&
          Math.abs(currentY - lastY) > 5
        ) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(" "));
          }

          currentLine = [];
        }

        currentLine.push(text);

        lastY = currentY;
      }

      // Add the final line
      if (currentLine.length > 0) {
        lines.push(currentLine.join(" "));
      }

      fullText += lines.join("\n") + "\n\n";
    }

    return fullText.trim();

  } catch (error) {
    console.error("PDF extraction error:", error);

    throw new Error(
      "Unable to extract text from this PDF."
    );
  }
}