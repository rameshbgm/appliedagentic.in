// components/admin/editor/LineHeight.ts
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType
      unsetLineHeight: () => ReturnType
    }
  }
}

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) => {
          return (
            commands.updateAttributes('paragraph', { lineHeight }) ||
            commands.updateAttributes('heading', { lineHeight })
          )
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          return (
            commands.updateAttributes('paragraph', { lineHeight: null }) ||
            commands.updateAttributes('heading', { lineHeight: null })
          )
        },
    }
  },
})
