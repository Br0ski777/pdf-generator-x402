import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "pdf-generator",
  slug: "pdf-generator",
  description: "Generate PDF documents from HTML or Markdown content with custom formatting.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/generate",
      price: "$0.008",
      description: "Generate a PDF from HTML or Markdown content",
      mimeType: "application/pdf",
      toolName: "document_generate_pdf",
      toolDescription: "Use this when you need to create a PDF document from HTML or Markdown content. Supports custom page size, margins, headers, footers. Returns binary PDF. Ideal for generating reports, invoices, proposals, contracts, or any formatted document from data. Do NOT use for web page capture — use webpage_to_pdf. Do NOT use for screenshots — use capture_screenshot.",
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
