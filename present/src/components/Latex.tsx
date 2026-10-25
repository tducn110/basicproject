import React, { useMemo } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface LatexProps {
  children?: string
  math?: string
  display?: boolean
  className?: string
}

function cleanMathString(raw: string): string {
  let s = raw.trim()
  if (s.startsWith("$$") && s.endsWith("$$")) {
    s = s.slice(2, -2).trim()
  } else if (s.startsWith("$") && s.endsWith("$")) {
    s = s.slice(1, -1).trim()
  } else if (s.startsWith("\\[") && s.endsWith("\\]")) {
    s = s.slice(2, -2).trim()
  } else if (s.startsWith("\\(") && s.endsWith("\\)")) {
    s = s.slice(2, -2).trim()
  }
  return s
}

/**
 * Pure KaTeX Formula Renderer via synchronous renderToString (Zero layout shift, no FOUC)
 */
export const Latex: React.FC<LatexProps> = ({ children, math, display = false, className = "" }) => {
  const rawMath = math || children || ""
  const cleaned = cleanMathString(rawMath)

  const html = useMemo(() => {
    if (!cleaned) return ""
    try {
      return katex.renderToString(cleaned, {
        displayMode: display,
        throwOnError: false,
        output: "html",
        strict: false,
        trust: true,
      })
    } catch (e) {
      console.warn("KaTeX renderToString error:", e, cleaned)
      return cleaned
    }
  }, [cleaned, display])

  if (!html) return null

  if (display) {
    return (
      <div 
        className={`katex-block my-2 overflow-x-auto text-center py-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <span 
      className={`katex-inline inline-block align-middle px-0.5 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * Mixed Text & KaTeX Renderer (Parses text containing $...$ or $$...$$)
 */
interface MathTextProps {
  children?: React.ReactNode
  text?: string
  className?: string
}

export const MathText: React.FC<MathTextProps> = ({
  children,
  text,
  className = "",
}) => {
  const content = typeof children === "string" ? children : (text || "")
  if (!content) return null

  // Split by $$...$$ or $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g
  const parts = content.split(regex)

  if (parts.length === 1) {
    return <span className={className}>{content}</span>
  }

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (!part) return null
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim()
          return <Latex key={idx} display>{formula}</Latex>
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1).trim()
          return <Latex key={idx}>{formula}</Latex>
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>
      })}
    </span>
  )
}
