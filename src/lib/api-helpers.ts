import { NextResponse } from "next/server"

export type ParsedBody<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response }

export async function parseRequestBody<T>(
  request: Request,
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: any } },
): Promise<ParsedBody<T>> {
  const ct = (request.headers.get("content-type") || "").toLowerCase()

  let raw: any = null
  try {
    if (ct.includes("application/json")) {
      raw = await request.json().catch(() => null)
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
  } catch {
    raw = null
  }

  if (raw == null || (typeof raw === "object" && Object.keys(raw).length === 0)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid input." }, { status: 400 }),
    }
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid input.", details: parsed.error?.errors ?? parsed.error },
        { status: 400 },
      ),
    }
  }

  return { ok: true, data: parsed.data }
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