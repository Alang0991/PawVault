export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireFounder } from "@/lib/server-auth"
import { z } from "zod"

const listSchema = z.object({
  severity: z.string().optional(),
  resolved: z.string().optional(),
  endpoint: z.string().optional(),
  limit: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    await requireFounder()
    const { searchParams } = new URL(request.url)
    const parsed = listSchema.safeParse(Object.fromEntries(searchParams.entries()))
    const q = parsed.data ?? {}

    const where: any = {}
    if (q.severity) where.severity = q.severity
    if (q.resolved === "true") where.resolved = true
    else if (q.resolved === "false") where.resolved = false
    if (q.endpoint) where.endpoint = { contains: q.endpoint, mode: "insensitive" }

    const limit = Math.min(Number(q.limit) || 100, 200)

    const [errors, counts] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        orderBy: { occurredAt: "desc" },
        take: limit,
        include: {
          user: { select: { username: true, displayName: true, role: true } },
        },
      }),
      prisma.errorLog.groupBy({
        by: ["severity", "resolved"],
        where: {},
        _count: { _all: true },
      }),
    ])

    return NextResponse.json({ errors, counts })
  } catch (error) {
    console.error("Get error logs error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const updateSchema = z.object({
  errorId: z.string().min(1),
  resolved: z.boolean(),
})

export async function PATCH(request: Request) {
  try {
    const ctx = await requireFounder()
    const body = await request.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const error = await prisma.errorLog.update({
      where: { id: parsed.data.errorId },
      data: parsed.data.resolved
        ? { resolved: true, resolvedAt: new Date(), resolvedById: ctx.id }
        : { resolved: false, resolvedAt: null, resolvedById: null },
    })

    return NextResponse.json({ error })
  } catch (e) {
    console.error("Update error log error:", e)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

const reportSchema = z.object({
  severity: z.enum(["ERROR", "WARNING", "FATAL"]),
  message: z.string().min(1).max(2000),
  stack: z.string().optional(),
  endpoint: z.string().optional(),
  method: z.string().optional(),
  statusCode: z.number().int().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  userId: z.string().optional(),
  context: z.record(z.unknown()).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const error = await prisma.errorLog.create({
      data: {
        severity: parsed.data.severity,
        message: parsed.data.message,
        stack: parsed.data.stack ?? null,
        endpoint: parsed.data.endpoint ?? null,
        method: parsed.data.method ?? null,
        statusCode: parsed.data.statusCode ?? null,
        userAgent: parsed.data.userAgent ?? null,
        ipAddress: parsed.data.ipAddress ?? null,
        userId: parsed.data.userId ?? null,
        context: parsed.data.context as any,
      },
    })

    return NextResponse.json({ ok: true, errorId: error.id }, { status: 201 })
  } catch (error) {
    console.error("Report error error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}