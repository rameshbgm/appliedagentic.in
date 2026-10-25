// app/(public)/template.tsx
// Re-mounts on every navigation, so each page settles in with a soft fade.
// fill-mode "backwards" leaves no transform behind, keeping fixed UI anchored.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="f-page">{children}</div>
}
