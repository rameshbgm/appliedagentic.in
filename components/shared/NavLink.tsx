'use client'
// components/shared/NavLink.tsx
// Drop-in replacement for Next.js Link that shows the loading modal on navigation.
// Can be imported from both server and client components.
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useArticleLoading } from './ArticleLoadingContext'

type Props = ComponentProps<typeof Link>

export default function NavLink({ href, onClick, children, ...rest }: Props) {
  const { showLoading } = useArticleLoading()

  return (
    <Link
      href={href}
      onClick={(e) => {
        showLoading(href.toString())
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </Link>
  )
}
