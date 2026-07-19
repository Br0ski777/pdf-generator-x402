# PDF Generator API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://pdf-generator.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Generate PDF documents from HTML or Markdown. Custom page size, margins, headers. Ideal for reports and invoices. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "pdf-generator": {
      "url": "https://pdf-generator.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://pdf-generator.api.klymax402.com/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"content":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `document_generate_pdf` | POST | `/api/generate` | $0.015 | Generate a PDF from HTML or Markdown content |

### `document_generate_pdf`

Use this when you need to create a PDF document from HTML or Markdown content. Returns binary PDF with custom formatting.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `content` | string | yes | HTML or Markdown content to convert to PDF |
| `format` | string | no | Content format: html or markdown (default: html) |
| `pageSize` | string | no | Page size: A4, Letter, or Legal (default: A4) |
| `landscape` | boolean | no | Landscape orientation (default: false) |
| `margins` | object | no | Custom margins (default: 20mm all sides) |

Example response:

```json
binary PDF with Content-Type application/pdf, rendered from "<h1>Invoice #42</h1><p>Total: $1,200</p>" into a formatted A4 document.
```

**When to use**: generating reports, invoices, proposals, contracts, or any formatted document from structured data. Essential when you have data/content and need a downloadable PDF.

**Not for**: capturing a live web page as PDF (use `webpage_to_pdf`), screenshots (use `capture_screenshot`), rendering markdown with CSS themes (use `text_render_markdown`).

## Example agent prompts

- "Create a PDF document from HTML or Markdown content"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
