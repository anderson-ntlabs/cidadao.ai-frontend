"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "start" | "center" | "end"
  sideOffset?: number
}

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  selected?: boolean
}

const Dropdown = ({ trigger, children, align = "start", sideOffset = 4 }: DropdownProps) => {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0"
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
            alignClasses[align]
          )}
          style={{ top: `calc(100% + ${sideOffset}px)` }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

const DropdownMenu = ({ children, className }: DropdownMenuProps) => {
  return <div className={cn("py-1", className)}>{children}</div>
}

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className, disabled, selected, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          disabled && "pointer-events-none opacity-50",
          !disabled && "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          selected && "bg-accent",
          className
        )}
        {...props}
      >
        {selected && (
          <Check className="absolute left-2 h-3.5 w-3.5" />
        )}
        <span className={selected ? "pl-6" : ""}>{children}</span>
      </div>
    )
  }
)
DropdownItem.displayName = "DropdownItem"

const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
DropdownLabel.displayName = "DropdownLabel"

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownSeparator.displayName = "DropdownSeparator"

export {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
}