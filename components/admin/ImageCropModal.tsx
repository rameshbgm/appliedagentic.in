'use client'
// components/admin/ImageCropModal.tsx
// Client-side crop + optional resize using react-image-crop.
// After the user confirms, it POSTs to /api/media/crop and returns the new URL.
import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Loader2, X, Crop as CropIcon, Expand } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  imageUrl: string
  mediaAssetId: number
  onComplete: (newUrl: string, newAssetId: number) => void
  onClose: () => void
  /** Lock to a specific aspect ratio (e.g. 16/9) — optional */
  aspect?: number
}

const PRESET_RATIOS: { label: string; value: number | undefined }[] = [
  { label: 'Free',   value: undefined },
  { label: '1:1',    value: 1 },
  { label: '4:3',    value: 4 / 3 },
  { label: '16:9',   value: 16 / 9 },
  { label: '3:2',    value: 3 / 2 },
  { label: '2:3',    value: 2 / 3 },
]

export default function ImageCropModal({ imageUrl, mediaAssetId, onComplete, onClose, aspect: initialAspect }: Props) {
  const [crop, setCrop] = useState<Crop>()
  const [aspect, setAspect] = useState<number | undefined>(initialAspect)
  const [saving, setSaving] = useState(false)
  const [outputWidth, setOutputWidth] = useState('')
  const [outputHeight, setOutputHeight] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)

  // When the image loads, default to a centered crop of 80%
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 80 },
        aspect ?? naturalWidth / naturalHeight,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    )
    setCrop(initialCrop)
  }, [aspect])

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect)
    if (!imgRef.current || !crop) return
    const { naturalWidth, naturalHeight } = imgRef.current
    const updated = centerCrop(
      makeAspectCrop(
        { unit: '%', width: crop.unit === '%' ? crop.width : (crop.width / naturalWidth) * 100 },
        newAspect ?? naturalWidth / naturalHeight,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    )
    setCrop(updated)
  }

  const handleApply = async () => {
    if (!crop || !crop.width || !crop.height) {
      toast.error('Please select a crop area')
      return
    }

    // Ensure we have pixel-based crop percentages
    const c = crop.unit === '%' ? crop : (() => {
      const nw = imgRef.current?.naturalWidth ?? 1
      const nh = imgRef.current?.naturalHeight ?? 1
      return { unit: '%' as const, x: (crop.x / nw) * 100, y: (crop.y / nh) * 100, width: (crop.width / nw) * 100, height: (crop.height / nh) * 100 }
    })()

    setSaving(true)
    try {
      const res = await fetch('/api/media/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaAssetId,
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height,
          outputWidth:  outputWidth  ? parseInt(outputWidth)  : undefined,
          outputHeight: outputHeight ? parseInt(outputHeight) : undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error ?? 'Crop failed')
      toast.success('Image cropped!')
      onComplete(data.data.url, data.data.mediaAssetId)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Crop failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden border shadow-2xl"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--bg-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--bg-border)' }}
        >
          <div className="flex items-center gap-2">
            <CropIcon size={16} style={{ color: 'var(--color-violet)' }} />
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Crop &amp; Resize
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Aspect ratio presets */}
        <div
          className="flex items-center gap-2 px-5 py-3 border-b shrink-0 flex-wrap"
          style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-surface)' }}
        >
          <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Aspect:</span>
          {PRESET_RATIOS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handleAspectChange(p.value)}
              className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors"
              style={{
                borderColor: aspect === p.value ? 'var(--color-violet)' : 'var(--bg-border)',
                background: aspect === p.value ? 'rgba(124,58,237,0.1)' : 'transparent',
                color: aspect === p.value ? 'var(--color-violet)' : 'var(--text-secondary)',
              }}
            >
              {p.label}
            </button>
          ))}

          {/* Output size */}
          <div className="flex items-center gap-1 ml-auto">
            <Expand size={13} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Output:</span>
            <input
              type="number"
              placeholder="W px"
              value={outputWidth}
              onChange={(e) => setOutputWidth(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg border text-xs outline-none"
              style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>×</span>
            <input
              type="number"
              placeholder="H px"
              value={outputHeight}
              onChange={(e) => setOutputHeight(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg border text-xs outline-none"
              style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-0" style={{ background: '#111' }}>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={aspect}
            minWidth={5}
            minHeight={5}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              onLoad={onImageLoad}
              alt="Crop preview"
              style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-4 border-t shrink-0"
          style={{ borderColor: 'var(--bg-border)', background: 'var(--bg-surface)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Drag to move • Drag edges to resize • A new cropped image will be saved to your media library.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--bg-border)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={saving || !crop?.width}
              className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5 transition-colors"
              style={{ background: 'var(--color-violet)', color: '#fff' }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CropIcon size={13} />}
              {saving ? 'Saving…' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
