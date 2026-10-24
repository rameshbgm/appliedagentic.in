// app/(public)/template.tsx
// Templates re-mount on every navigation, so each page enters with a short
// rise-and-focus transition (disabled for reduced motion in globals.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="p-page">{children}</div>
}
