"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  File as FileIcon,
  FileText,
  Folder as FolderIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProductFileDTO {
  id: string
  filename: string
  url: string
  size: number
  folder: string
  version: string | null
  platform: string | null
  createdAt: string
}

type UploadStatus = "queued" | "uploading" | "uploaded" | "failed" | "cancelled"

interface UploadItem {
  localId: string
  file: File
  relativePath: string
  folder: string
  status: UploadStatus
  progress: number
  speedBps: number
  error?: string
  xhr?: XMLHttpRequest
  startedAt?: number
  serverFile?: ProductFileDTO
  retryToken?: number
}

const MAX_CONCURRENT = 3

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const exp = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, exp)
  return `${value.toFixed(value >= 100 || exp === 0 ? 0 : value >= 10 ? 1 : 2)} ${units[exp]}`
}

function formatSpeed(bps: number): string {
  if (bps <= 0) return ""
  return `${formatBytes(bps)}/s`
}

function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return ""
  if (seconds < 1) return "< 1s"
  if (seconds < 60) return `${Math.round(seconds)}s left`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s left`
}

function getExtension(name: string): string {
  const i = name.lastIndexOf(".")
  if (i < 0) return ""
  return name.slice(i).toLowerCase()
}

function joinFolder(parent: string, child: string): string {
  const p = parent.replace(/\\/g, "/").replace(/\/$/, "")
  const c = child.replace(/\\/g, "/").replace(/^\//, "")
  if (!p) return c
  if (!c) return p
  return `${p}/${c}`
}

function parentOf(path: string): string {
  const norm = path.replace(/\\/g, "/").replace(/\/$/, "")
  const i = norm.lastIndexOf("/")
  return i < 0 ? "" : norm.slice(0, i)
}

export function FilesContentManager({
  productId,
  isPublished,
  initialFiles,
}: {
  productId: string
  isPublished: boolean
  initialFiles: ProductFileDTO[]
}) {
  const [files, setFiles] = useState<ProductFileDTO[]>(initialFiles)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [currentFolder, setCurrentFolder] = useState("")
  const [folderInput, setFolderInput] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [showAccessList, setShowAccessList] = useState(true)
  const inputFilesRef = useRef<HTMLInputElement>(null)
  const inputFolderRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  const foldersInRoot = useMemo(() => {
    const set = new Set<string>()
    files.forEach((f) => {
      if (f.folder) set.add(parentOf(f.folder) === "" ? f.folder.split("/")[0] : f.folder.split("/")[0])
    })
    if (currentFolder === "") {
      return Array.from(set).sort()
    }
    return []
  }, [files, currentFolder])

  const foldersHere = useMemo(() => {
    if (currentFolder === "") {
      const set = new Set<string>()
      files.forEach((f) => {
        if (!f.folder) return
        const first = f.folder.split("/")[0]
        set.add(first)
      })
      return Array.from(set).sort()
    }
    const set = new Set<string>()
    const prefix = currentFolder + "/"
    files.forEach((f) => {
      if (!f.folder || !f.folder.startsWith(prefix)) return
      const rest = f.folder.slice(prefix.length)
      const first = rest.split("/")[0]
      if (first) set.add(first)
    })
    return Array.from(set).sort()
  }, [files, currentFolder])

  const filesHere = useMemo(() => {
    return files.filter((f) => (f.folder || "") === currentFolder)
  }, [files, currentFolder])

  const subfoldersForAccess = useMemo(() => {
    const set = new Set<string>()
    files.forEach((f) => {
      if (!f.folder) return
      const parts = f.folder.split("/")
      for (let i = 1; i <= parts.length; i++) {
        set.add(parts.slice(0, i).join("/"))
      }
    })
    return Array.from(set).sort()
  }, [files])

  const updateUpload = (id: string, patch: Partial<UploadItem>) => {
    setUploads((prev) => prev.map((u) => (u.localId === id ? { ...u, ...patch } : u)))
  }

  const startUpload = useCallback(
    (item: UploadItem) => {
      return new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest()
        const fd = new FormData()
        fd.append("file", item.file)
        fd.append("productId", productId)
        if (item.folder) fd.append("folder", item.folder)
        if (item.relativePath) fd.append("relativePath", item.relativePath)

        xhr.open("POST", "/api/products/files")
        xhr.responseType = "json"
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return
          const elapsed = (Date.now() - (item.startedAt || Date.now())) / 1000
          const speed = elapsed > 0 ? e.loaded / elapsed : 0
          const remaining = e.total - e.loaded
          const eta = speed > 0 ? remaining / speed : 0
          updateUpload(item.localId, {
            status: "uploading",
            progress: e.total > 0 ? Math.min(99, Math.round((e.loaded / e.total) * 100)) : 0,
            speedBps: speed,
            startedAt: item.startedAt || Date.now(),
            xhr,
            error: undefined,
            retryToken: (item.retryToken || 0),
          })
          void eta
        }
        xhr.onload = () => {
          const res = xhr.response
          if (xhr.status >= 200 && xhr.status < 300 && res?.file) {
            const saved: ProductFileDTO = {
              id: res.file.id,
              filename: res.file.filename,
              url: res.file.url,
              size: res.file.size ?? item.file.size,
              folder: res.file.folder ?? item.folder,
              version: res.file.version ?? null,
              platform: res.file.platform ?? null,
              createdAt: res.file.createdAt ?? new Date().toISOString(),
            }
            setFiles((prev) => [...prev, saved])
            updateUpload(item.localId, { status: "uploaded", progress: 100, serverFile: saved, xhr: undefined })
            resolve()
          } else {
            const msg = res?.error || `Upload failed (${xhr.status}).`
            updateUpload(item.localId, { status: "failed", error: msg, xhr: undefined })
            resolve()
          }
        }
        xhr.onerror = () => {
          updateUpload(item.localId, {
            status: "failed",
            error: "Network error. Check your connection and try again.",
            xhr: undefined,
          })
          resolve()
        }
        xhr.onabort = () => {
          updateUpload(item.localId, { status: "cancelled", xhr: undefined })
          resolve()
        }
        item.xhr = xhr
        item.startedAt = Date.now()
        xhr.send(fd)
      })
    },
    [productId],
  )

  useEffect(() => {
    let cancelled = false
    async function pump() {
      while (!cancelled) {
        const inflight = uploads.filter((u) => u.status === "uploading").length
        if (inflight >= MAX_CONCURRENT) return
        const next = uploads.find((u) => u.status === "queued")
        if (!next) return
        updateUpload(next.localId, { status: "uploading", startedAt: Date.now() })
        await startUpload(next)
      }
    }
    pump()
    return () => {
      cancelled = true
    }
  }, [uploads, startUpload])

  const enqueueFiles = useCallback(
    (fileList: FileList | File[], relativeBase = "") => {
      const list = Array.from(fileList)
      if (list.length === 0) return
      const newItems: UploadItem[] = list.map((f, i) => {
        const rel = (f as any).webkitRelativePath || (relativeBase ? `${relativeBase}/${f.name}` : f.name)
        const folderFromPath = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : currentFolder
        return {
          localId: `u-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          relativePath: rel,
          folder: folderFromPath || currentFolder,
          status: "queued",
          progress: 0,
          speedBps: 0,
        }
      })
      setUploads((prev) => [...prev, ...newItems])
      setError(null)
    },
    [currentFolder],
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const items = e.dataTransfer.items
    const files: File[] = []
    if (items && items.length > 0 && (items as any)[0]?.webkitGetAsEntry) {
      const entries: any[] = []
      for (let i = 0; i < items.length; i++) entries.push(items[i].webkitGetAsEntry())
      const promises = entries.map((entry) => readEntry(entry, ""))
      Promise.all(promises).then((results) => {
        const flat = results.flat()
        if (flat.length > 0) enqueueFiles(flat, "")
      })
    } else {
      files.push(...Array.from(e.dataTransfer.files))
      if (files.length > 0) enqueueFiles(files, "")
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      enqueueFiles(e.target.files, "")
      e.target.value = ""
    }
  }

  function handleFolderInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      enqueueFiles(e.target.files, "")
      e.target.value = ""
    }
  }

  function retryUpload(localId: string) {
    setUploads((prev) => prev.map((u) =>
      u.localId === localId ? { ...u, status: "queued", progress: 0, error: undefined, retryToken: (u.retryToken || 0) + 1 } : u,
    ))
  }

  function cancelUpload(localId: string) {
    setUploads((prev) => {
      const u = prev.find((x) => x.localId === localId)
      if (u?.xhr) {
        try { u.xhr.abort() } catch { /* noop */ }
      }
      return prev.filter((x) => x.localId !== localId)
    })
  }

  function dismissUpload(localId: string) {
    setUploads((prev) => prev.filter((u) => u.localId !== localId || u.status === "uploading"))
  }

  function clearCompleted() {
    setUploads((prev) => prev.filter((u) => u.status === "uploading" || u.status === "queued"))
  }

  function createFolder() {
    const name = folderInput.trim()
    if (!name) return
    const candidate = joinFolder(currentFolder, name)
    if (subfoldersForAccess.includes(candidate) || files.some((f) => (f.folder || "") === candidate)) {
      setError("A folder with that name already exists here.")
      return
    }
    setCurrentFolder(candidate)
    setFolderInput("")
    setIsCreatingFolder(false)
    setNotice(`Folder "${name}" ready. Drop files here to add them.`)
  }

  async function deleteFolder(folder: string) {
    if (!confirm(`Delete the folder "${folder}" and all files inside it? This cannot be undone.`)) return
    const inFolder = files.filter((f) => (f.folder || "") === folder || (f.folder || "").startsWith(folder + "/"))
    for (const f of inFolder) {
      await fetch(`/api/products/files/${f.id}`, { method: "DELETE" })
    }
    setFiles((prev) => prev.filter((f) => !inFolder.some((x) => x.id === f.id)))
    if (currentFolder === folder) setCurrentFolder(parentOf(folder) || "")
    setNotice(`Removed folder "${folder}" and ${inFolder.length} file${inFolder.length === 1 ? "" : "s"}.`)
  }

  async function moveFile(file: ProductFileDTO, newFolder: string) {
    setError(null)
    const r = await fetch(`/api/creator/products/${productId}/files/${file.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: newFolder || "" }),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      setError(err.error || "We couldn't move that file.")
      return
    }
    setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, folder: newFolder } : f)))
    setNotice(`Moved "${file.filename}".`)
  }

  async function deleteFile(file: ProductFileDTO) {
    if (!confirm(`Delete "${file.filename}" permanently?`)) return
    const r = await fetch(`/api/products/files/${file.id}`, { method: "DELETE" })
    if (r.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== file.id))
      setNotice(`Deleted "${file.filename}".`)
    } else {
      setError("We couldn't delete that file. Please try again.")
    }
  }

  const totalSize = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files])
  const activeUploads = uploads.filter((u) => u.status === "uploading" || u.status === "queued")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Upload files</CardTitle>
              <CardDescription>
                Drag files or a whole folder. Folders keep their structure. Failed uploads can be retried.
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreatingFolder(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> New folder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-3 p-3 rounded-lg bg-red-100 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {notice && (
            <div className="mb-3 p-3 rounded-lg bg-green-100 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {notice}
            </div>
          )}
          {isCreatingFolder && (
            <div className="mb-3 flex items-center gap-2 p-3 rounded-lg border bg-muted/40">
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Folder name"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createFolder()
                  if (e.key === "Escape") { setIsCreatingFolder(false); setFolderInput("") }
                }}
              />
              <Button onClick={createFolder}>Create</Button>
              <Button variant="ghost" onClick={() => { setIsCreatingFolder(false); setFolderInput("") }}>Cancel</Button>
            </div>
          )}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
              dragOver ? "border-purple-500 bg-purple-50/10" : "border-muted-foreground/25 hover:border-purple-500/60",
            )}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Drag files or folders here</p>
            <p className="text-sm text-muted-foreground mt-1">or use the buttons below</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button type="button" variant="default" onClick={(e) => { e.preventDefault(); inputFilesRef.current?.click() }}>
                Browse files
              </Button>
              <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); inputFolderRef.current?.click() }}>
                Browse folder
              </Button>
            </div>
            <input
              ref={inputFilesRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
            <input
              ref={inputFolderRef}
              type="file"
              multiple
              // @ts-expect-error webkitdirectory is non-standard
              webkitdirectory=""
              directory=""
              className="hidden"
              onChange={handleFolderInput}
            />
            <p className="text-xs text-muted-foreground mt-4">
              Upload up to 10GB per file. Any digital product format is supported.
            </p>
          </label>
        </CardContent>
      </Card>

      {activeUploads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Uploading</CardTitle>
                <CardDescription>
                  {activeUploads.length} item{activeUploads.length === 1 ? "" : "s"} in progress
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearCompleted}>Clear finished</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {uploads.map((u) => (
              <UploadRow key={u.localId} item={u} onRetry={retryUpload} onCancel={cancelUpload} onDismiss={dismissUpload} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>File library</CardTitle>
              <CardDescription>
                {files.length} file{files.length === 1 ? "" : "s"} · {formatBytes(totalSize)} total
              </CardDescription>
            </div>
            <Breadcrumb currentFolder={currentFolder} onNavigate={setCurrentFolder} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentFolder === "" && foldersHere.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {foldersHere.map((f) => (
                <FolderCard
                  key={f}
                  name={f}
                  fullPath={f}
                  fileCount={files.filter((x) => (x.folder || "").startsWith(f + "/") || (x.folder || "") === f).length}
                  onOpen={() => setCurrentFolder(f)}
                  onDelete={() => deleteFolder(f)}
                />
              ))}
            </div>
          )}
          {currentFolder !== "" && foldersHere.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="ghost" className="justify-start" onClick={() => setCurrentFolder(parentOf(currentFolder))}>
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" /> ..
              </Button>
              {foldersHere.map((f) => {
                const full = joinFolder(currentFolder, f)
                return (
                  <FolderCard
                    key={full}
                    name={f}
                    fullPath={full}
                    fileCount={files.filter((x) => (x.folder || "").startsWith(full + "/") || (x.folder || "") === full).length}
                    onOpen={() => setCurrentFolder(full)}
                    onDelete={() => deleteFolder(full)}
                  />
                )
              })}
            </div>
          )}

          {filesHere.length === 0 && foldersHere.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <FileIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              No files in this folder yet. Drag files above to upload.
            </div>
          ) : (
            <div className="space-y-1.5">
              {filesHere.map((f) => (
                <FileRow
                  key={f.id}
                  file={f}
                  folders={subfoldersForAccess}
                  onMove={(newFolder) => moveFile(f, newFolder)}
                  onDelete={() => deleteFile(f)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>File access</CardTitle>
              <CardDescription>
                {isPublished
                  ? "These are the files customers will receive after purchase."
                  : "Files will be available to customers once this product is published."}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAccessList((v) => !v)}>
              {showAccessList ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        {showAccessList && (
          <CardContent>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files attached to this product yet.</p>
            ) : (
              <div className="space-y-1 text-sm">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="truncate">
                      {f.folder ? `${f.folder}/` : ""}{f.filename}
                    </span>
                    <span className="ml-auto text-xs">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function Breadcrumb({ currentFolder, onNavigate }: { currentFolder: string; onNavigate: (p: string) => void }) {
  const parts = currentFolder ? currentFolder.split("/") : []
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
      <button className="hover:text-foreground" onClick={() => onNavigate("")}>root</button>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          <button className="hover:text-foreground" onClick={() => onNavigate(parts.slice(0, i + 1).join("/"))}>{p}</button>
        </span>
      ))}
    </div>
  )
}

function FolderCard({
  name,
  fullPath,
  fileCount,
  onOpen,
  onDelete,
}: {
  name: string
  fullPath: string
  fileCount: number
  onOpen: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border bg-card hover:bg-muted/30 p-3 cursor-pointer" onClick={onOpen}>
      <FolderIcon className="h-5 w-5 text-purple-500 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{fileCount} item{fileCount === 1 ? "" : "s"}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
      </Button>
    </div>
  )
}

function FileRow({
  file,
  folders,
  onMove,
  onDelete,
}: {
  file: ProductFileDTO
  folders: string[]
  onMove: (newFolder: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [moveTarget, setMoveTarget] = useState(file.folder)
  const ext = getExtension(file.filename)
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{file.filename}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {ext && <Badge variant="outline" className="text-[10px]">{ext}</Badge>}
          <span>{formatBytes(file.size)}</span>
          {file.folder && <span>in {file.folder}/</span>}
          <span>uploaded {new Date(file.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <select
            value={moveTarget}
            onChange={(e) => setMoveTarget(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            <option value="">(root)</option>
            {folders.map((f) => <option key={f} value={f}>{f}/</option>)}
          </select>
          <Button size="sm" onClick={() => { onMove(moveTarget); setEditing(false) }}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setMoveTarget(file.folder) }}>Cancel</Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" asChild title="Download file">
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Move</Button>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
          </Button>
        </div>
      )}
    </div>
  )
}

function UploadRow({
  item,
  onRetry,
  onCancel,
  onDismiss,
}: {
  item: UploadItem
  onRetry: (id: string) => void
  onCancel: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const ext = getExtension(item.file.name)
  const isActive = item.status === "uploading" || item.status === "queued"
  const pct = item.progress

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium truncate">{item.file.name}</p>
            {ext && <Badge variant="outline" className="text-[10px]">{ext}</Badge>}
            {item.folder && <Badge variant="secondary" className="text-[10px]">{item.folder}/</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatBytes(item.file.size)}
            {item.status === "uploading" && item.speedBps > 0 ? ` · ${formatSpeed(item.speedBps)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <Button size="sm" variant="ghost" onClick={() => onCancel(item.localId)}>Cancel</Button>
          ) : item.status === "uploaded" ? (
            <Button size="sm" variant="ghost" onClick={() => onDismiss(item.localId)}>Dismiss</Button>
          ) : item.status === "failed" ? (
            <>
              <span className="text-xs text-red-600 max-w-[200px] truncate" title={item.error}>{item.error}</span>
              <Button size="sm" variant="outline" onClick={() => onRetry(item.localId)}>
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDismiss(item.localId)}>Remove</Button>
            </>
          ) : item.status === "cancelled" ? (
            <>
              <span className="text-xs text-muted-foreground">Cancelled</span>
              <Button size="sm" variant="ghost" onClick={() => onDismiss(item.localId)}>Remove</Button>
            </>
          ) : null}
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        {item.status === "uploading" || item.status === "uploaded" ? (
          <div
            className={cn("h-full transition-all", item.status === "uploaded" ? "bg-green-500" : "bg-purple-500")}
            style={{ width: `${pct}%` }}
          />
        ) : item.status === "failed" ? (
          <div className="h-full w-full bg-red-500/60" />
        ) : item.status === "queued" ? (
          <div className="h-full w-1/3 bg-muted-foreground/30 animate-pulse" />
        ) : null}
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {item.status === "uploading" && `${pct}%`}
          {item.status === "queued" && "Queued"}
          {item.status === "uploaded" && "Uploaded"}
          {item.status === "failed" && "Failed"}
          {item.status === "cancelled" && "Cancelled"}
        </span>
        {item.status === "uploading" && pct < 99 && (
          <span>
            {item.speedBps > 0 ? formatEta(((item.file.size - (item.file.size * pct) / 100) / item.speedBps)) : ""}
            {item.status === "uploading" ? <Loader2 className="inline h-3 w-3 ml-1 animate-spin" /> : null}
          </span>
        )}
      </div>
    </div>
  )
}

function readEntry(entry: any, prefix: string): Promise<File[]> {
  return new Promise((resolve) => {
    if (!entry) return resolve([])
    if (entry.isFile) {
      entry.file((file: File) => {
        const rel = prefix ? `${prefix}/${file.name}` : file.name
        try { Object.defineProperty(file, "webkitRelativePath", { value: rel }) } catch { /* noop */ }
        resolve([file])
      }, () => resolve([]))
    } else if (entry.isDirectory) {
      const reader = entry.createReader()
      const all: File[] = []
      const readBatch = () => {
        reader.readEntries(async (entries: any[]) => {
          if (entries.length === 0) {
            resolve(all)
            return
          }
          const subPath = prefix ? `${prefix}/${entry.name}` : entry.name
          const subFiles = await Promise.all(entries.map((e) => readEntry(e, subPath)))
          all.push(...subFiles.flat())
          readBatch()
        }, () => resolve(all))
      }
      readBatch()
    } else {
      resolve([])
    }
  })
}
