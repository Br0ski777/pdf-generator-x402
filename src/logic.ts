import type { Hono } from "hono";
import puppeteer, { type Browser } from "puppeteer";

// ---------------------------------------------------------------------------
// Browser pool (reuse across requests)
// ---------------------------------------------------------------------------

const LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance?.connected) return browserInstance;
  const execPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.PLAYWRIGHT_CHROMIUM_PATH;
  browserInstance = await puppeteer.launch({
    args: LAUNCH_ARGS,
    headless: true,
    ...(execPath ? { executablePath: execPath } : {}),
  });
  return browserInstance;
}

// ---------------------------------------------------------------------------
// Simple Markdown to HTML converter
// ---------------------------------------------------------------------------

function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (fenced) — must come before inline code
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
    `<pre><code>${escapeHtml(code.trim())}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headings (h1-h6)
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Horizontal rules
  html = html.replace(/^(---|\*\*\*|___)\s*$/gm, "<hr>");

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^[-*+]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');

  // Line breaks: double newline = paragraph
  html = html.replace(/\n{2,}/g, "</p><p>");

  // Wrap in paragraphs (skip block elements)
  html = "<p>" + html + "</p>";
  html = html.replace(/<p>\s*(<(?:h[1-6]|ul|ol|pre|blockquote|hr|table)[^>]*>)/g, "$1");
  html = html.replace(/(<\/(?:h[1-6]|ul|ol|pre|blockquote|table)>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*<hr>\s*<\/p>/g, "<hr>");
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// HTML template wrapper
// ---------------------------------------------------------------------------

function wrapInTemplate(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.7;
    color: #1a1a1a;
    padding: 0;
  }
  h1 { font-size: 28px; font-weight: 700; margin: 0 0 16px 0; color: #111; }
  h2 { font-size: 22px; font-weight: 600; margin: 24px 0 12px 0; color: #222; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
  h3 { font-size: 18px; font-weight: 600; margin: 20px 0 8px 0; color: #333; }
  h4 { font-size: 16px; font-weight: 600; margin: 16px 0 6px 0; color: #444; }
  h5, h6 { font-size: 14px; font-weight: 600; margin: 12px 0 4px 0; color: #555; }
  p { margin: 0 0 12px 0; }
  a { color: #2563eb; text-decoration: underline; }
  strong { font-weight: 600; }
  em { font-style: italic; }
  ul, ol { margin: 0 0 12px 24px; }
  li { margin: 0 0 4px 0; }
  blockquote {
    border-left: 3px solid #d1d5db;
    padding: 8px 16px;
    margin: 12px 0;
    color: #555;
    background: #f9fafb;
  }
  code {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    background: #f3f4f6;
    padding: 2px 5px;
    border-radius: 3px;
  }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 12px 0;
  }
  pre code { background: none; color: inherit; padding: 0; }
  hr { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
  th { background: #f3f4f6; font-weight: 600; }
  img { max-width: 100%; height: auto; }
  del { text-decoration: line-through; color: #888; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Request body type
// ---------------------------------------------------------------------------

interface GenerateRequest {
  content: string;
  format?: "html" | "markdown";
  pageSize?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

export function registerRoutes(app: Hono) {
  app.post("/api/generate", async (c) => {
    let body: GenerateRequest;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    if (!body.content || typeof body.content !== "string") {
      return c.json({ error: "Missing required field: content (string)" }, 400);
    }

    if (body.content.length > 500_000) {
      return c.json({ error: "Content too large. Maximum 500KB." }, 400);
    }

    const format = body.format || "html";
    if (!["html", "markdown"].includes(format)) {
      return c.json({ error: "Invalid format. Use: html, markdown" }, 400);
    }

    const pageSize = body.pageSize || "A4";
    if (!["A4", "Letter", "Legal"].includes(pageSize)) {
      return c.json({ error: "Invalid pageSize. Use: A4, Letter, Legal" }, 400);
    }

    const landscape = body.landscape === true;
    const margins = {
      top: body.margins?.top || "20mm",
      right: body.margins?.right || "20mm",
      bottom: body.margins?.bottom || "20mm",
      left: body.margins?.left || "20mm",
    };

    // Convert content to full HTML
    let htmlContent: string;
    if (format === "markdown") {
      htmlContent = wrapInTemplate(markdownToHtml(body.content));
    } else {
      // If HTML doesn't have <html> tag, wrap it
      if (!body.content.toLowerCase().includes("<html")) {
        htmlContent = wrapInTemplate(body.content);
      } else {
        htmlContent = body.content;
      }
    }

    const startTime = Date.now();
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 30_000 });

      const pdf = await page.pdf({
        format: pageSize as any,
        landscape,
        printBackground: true,
        margin: margins,
      });

      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline; filename=document.pdf",
          "X-Generation-Time-Ms": String(Date.now() - startTime),
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PDF generation failed";
      return c.json({ error: msg, generation_time_ms: Date.now() - startTime }, 500);
    } finally {
      await page.close();
    }
  });
}
