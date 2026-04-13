import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "pdf-generator",
  slug: "pdf-generator",
  description: "Generate PDF documents from HTML or Markdown. Custom page size, margins, headers. Ideal for reports and invoices.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/generate",
      price: "$0.008",
      description: "Generate a PDF from HTML or Markdown content",
      mimeType: "application/pdf",
      toolName: "document_generate_pdf",
      toolDescription: `Use this when you need to create a PDF document from HTML or Markdown content. Returns binary PDF with custom formatting.

Returns: 1. Binary PDF file 2. Configurable page size (A4, Letter, Legal) 3. Custom margins (top/right/bottom/left) 4. Landscape or portrait orientation 5. HTML and Markdown input support.

Example output: binary PDF with Content-Type application/pdf, rendered from "<h1>Invoice #42</h1><p>Total: $1,200</p>" into a formatted A4 document.

Use this FOR generating reports, invoices, proposals, contracts, or any formatted document from structured data. Essential when you have data/content and need a downloadable PDF.

Do NOT use for capturing a live web page as PDF -- use webpage_to_pdf instead. Do NOT use for screenshots -- use capture_screenshot instead. Do NOT use for rendering markdown with CSS themes -- use text_render_markdown instead.`,
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "HTML or Markdown content to convert to PDF" },
          format: {
            type: "string",
            enum: ["html", "markdown"],
            description: "Content format: html or markdown (default: html)",
          },
          pageSize: {
            type: "string",
            enum: ["A4", "Letter", "Legal"],
            description: "Page size: A4, Letter, or Legal (default: A4)",
          },
          landscape: { type: "boolean", description: "Landscape orientation (default: false)" },
          margins: {
            type: "object",
            properties: {
              top: { type: "string", description: "Top margin (e.g. 20mm)" },
              right: { type: "string", description: "Right margin (e.g. 20mm)" },
              bottom: { type: "string", description: "Bottom margin (e.g. 20mm)" },
              left: { type: "string", description: "Left margin (e.g. 20mm)" },
            },
            description: "Custom margins (default: 20mm all sides)",
          },
        },
        required: ["content"],
      },
    },
  ],
};
