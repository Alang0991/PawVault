"use client"

import { useEffect } from "react"

interface ReportErrorOptions {
  severity?: "ERROR" | "WARNING" | "FATAL"
  endpoint?: string
  method?: string
  statusCode?: number
  context?: Record<string, unknown>
}

export function useErrorReporter() {
  useEffect(() => {
    function reportError(message: string, options: ReportErrorOptions = {}, stack?: string) {
      const payload: any = {
        severity: options.severity || "ERROR",
        message,
        stack,
        endpoint: options.endpoint || window.location.pathname,
        method: options.method,
        statusCode: options.statusCode,
        context: options.context,
      }
      try {
        fetch("/api/admin/error-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      } catch {
        // swallow
      }
    }

    function handleError(event: ErrorEvent) {
      const stack = event.error?.stack
      reportError(
        event.message || (event.error ? event.error.message : "Unknown error"),
        { severity: "ERROR" },
        stack,
      )
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason: any = event.reason
      const message = reason?.message || (typeof reason === "string" ? reason : "Unhandled rejection")
      reportError(message, { severity: "ERROR" }, reason?.stack)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])
}

export function reportClientError(message: string, options: ReportErrorOptions = {}, stack?: string) {
  const payload: any = {
    severity: options.severity || "ERROR",
    message,
    stack,
    endpoint: typeof window !== "undefined" ? window.location.pathname : undefined,
    method: options.method,
    statusCode: options.statusCode,
    context: options.context,
  }
  try {
    fetch("/api/admin/error-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // swallow
  }
}