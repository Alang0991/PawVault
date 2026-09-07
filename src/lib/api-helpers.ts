import { NextResponse } from "next/server"

export type ParsedBody<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response }

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: any }

export type BodySchema<T> = {
  safeParse: (v: unknown) => SafeParseResult<T>
}

export async function parseRequestBody<T>(
  request: Request,
  schema: BodySchema<T>,
): Promise<ParsedBody<T>> {
  const ct = (request.headers.get("content-type") || "").toLowerCase()

  let raw: any = null
  let parseError: string | undefined
  try {
    if (ct.includes("application/json")) {
      try {
        raw = await request.json()
      } catch (err) {
        parseError = `json-parse-failed: ${err instanceof Error ? err.message : "unknown"}`
        raw = null
      }
    } else if (
      ct.includes("application/x-www-form-urlencoded") ||
      ct.includes("multipart/form-data")
    ) {
      const fd = await request.formData().catch(() => null)
      if (fd) {
        raw = Object.fromEntries(fd.entries())
      }
    } else {
      const text = await request.text().catch(() => "")
      if (text) {
        try {
          raw = JSON.parse(text)
        } catch {
          const params = new URLSearchParams(text)
          raw = Object.fromEntries(params.entries())
        }
      }
    }
  } catch (err) {
    parseError = `body-read-failed: ${err instanceof Error ? err.message : "unknown"}`
    raw = null
  }

  if (raw == null || (typeof raw === "object" && Object.keys(raw).length === 0)) {
    console.warn("[parseRequestBody] empty body", {
      contentType: ct,
      parseError,
      method: request.method,
      url: request.url,
    })
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Invalid input.",
          reason: "empty_body",
          contentType: ct,
          details: parseError,
        },
        { status: 400 },
      ),
    }
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    console.warn("[parseRequestBody] schema validation failed", {
      contentType: ct,
      raw,
      issues: parsed.error?.issues ?? parsed.error?.errors,
    })
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Invalid input.",
          reason: "schema_validation_failed",
          contentType: ct,
          details: parsed.error?.issues ?? parsed.error?.errors ?? parsed.error,
        },
        { status: 400 },
      ),
    }
  }

  return { ok: true as const, data: parsed.data }
}

export function authorizationErrorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function authenticationErrorResponse(message = "Authentication required.") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverErrorResponse(message = "Something went wrong") {
  return NextResponse.json({ error: message }, { status: 500 })
}