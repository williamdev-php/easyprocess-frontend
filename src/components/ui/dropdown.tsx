"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  /** Group label — options with the same group are grouped together */
  group?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Custom trigger element — if provided, replaces default trigger button */
  trigger?: ReactNode;
  /** Alignment of the dropdown menu */
  align?: "left" | "right";
  /** Full width mode */
  fullWidth?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** Custom class for container */
  className?: string;
  /** Disable the dropdown */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Portal wrapper — renders dropdown menus at document.body level
// ---------------------------------------------------------------------------

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ---------------------------------------------------------------------------
// Hook: position a floating element relative to a trigger
// ---------------------------------------------------------------------------

function useFloatingPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  align: "left" | "right" = "left",
) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    function update() {
      const rect = triggerRef.current!.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: align === "right" ? undefined : rect.left,
        right: align === "right" ? window.innerWidth - rect.right : undefined,
        minWidth: rect.width,
        zIndex: 99999,
      });
    }

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, triggerRef, align]);

  return style;
}

// ---------------------------------------------------------------------------
// Generic dropdown menu (used when you need a menu with arbitrary items)
// ---------------------------------------------------------------------------

export interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  trigger,
  children,
  align = "left",
  className = "",
  open: controlledOpen,
  onOpenChange,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (v: boolean) => {
      if (isControlled) {
        onOpenChange?.(v);
      } else {
        setInternalOpen(v);
      }
    },
    [isControlled, onOpenChange],
  );

  // Exit animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, setOpen]);

  const floatingStyle = useFloatingPosition(triggerRef, isOpen, align);

  return (
    <div className={`relative ${className}`}>
      <div ref={triggerRef} onClick={() => setOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {visible && (
        <Portal>
          <div
            ref={menuRef}
            style={floatingStyle}
            className={`rounded-xl border border-border-light bg-white py-1.5 shadow-xl ${closing ? 'animate-dropdown-out' : 'animate-dropdown'}`}
          >
            {children}
          </div>
        </Portal>
      )}
    </div>
  );
}

/** Menu item for DropdownMenu */
export function DropdownMenuItem({
  children,
  onClick,
  icon,
  description,
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-deep/5 disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-text-secondary">{children}</div>
        {description && (
          <p className="mt-0.5 text-xs text-text-muted leading-relaxed">{description}</p>
        )}
      </div>
    </button>
  );
}

/** Separator for DropdownMenu */
export function DropdownMenuSeparator() {
  return <div className="my-1.5 border-t border-border-light" />;
}

// ---------------------------------------------------------------------------
// Select-style Dropdown (replaces native <select>)
// ---------------------------------------------------------------------------

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  trigger: customTrigger,
  align = "left",
  fullWidth = false,
  size = "md",
  className = "",
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Exit animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  function handleSelect(val: string) {
    onChange?.(val);
    setIsOpen(false);
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-xs",
    md: "px-3 py-2.5 text-sm",
  };

  const floatingStyle = useFloatingPosition(triggerRef, isOpen, align);

  // Group options if any have a group field
  const hasGroups = options.some((o) => o.group);

  function renderOptions() {
    if (!hasGroups) {
      return options.map((option) => renderOption(option));
    }

    // Group options
    const grouped: { group: string; items: DropdownOption[] }[] = [];
    const ungrouped: DropdownOption[] = [];

    for (const option of options) {
      if (option.group) {
        const existing = grouped.find((g) => g.group === option.group);
        if (existing) {
          existing.items.push(option);
        } else {
          grouped.push({ group: option.group, items: [option] });
        }
      } else {
        ungrouped.push(option);
      }
    }

    return (
      <>
        {ungrouped.map((option) => renderOption(option))}
        {grouped.map((g) => (
          <div key={g.group}>
            <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {g.group}
            </div>
            {g.items.map((option) => renderOption(option))}
          </div>
        ))}
      </>
    );
  }

  function renderOption(option: DropdownOption) {
    const isSelected = option.value === value;
    return (
      <button
        key={option.value}
        type="button"
        onClick={() => handleSelect(option.value)}
        disabled={option.disabled}
        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none ${
          isSelected
            ? "bg-primary-deep/5 text-primary-deep font-semibold"
            : "text-text-secondary hover:bg-primary-deep/5 hover:text-primary-deep"
        }`}
      >
        {option.icon && <span className="shrink-0">{option.icon}</span>}
        <span className="flex-1 truncate">{option.label}</span>
        {isSelected && (
          <svg className="h-4 w-4 shrink-0 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div
      className={`relative ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {/* Trigger */}
      <div ref={triggerRef}>
        {customTrigger ? (
          <div
            onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
            className={disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}
          >
            {customTrigger}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`flex items-center justify-between gap-2 rounded-xl border border-border-light bg-white font-medium text-text-primary outline-none transition-all focus:border-primary-deep focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none ${
              fullWidth ? "w-full" : ""
            } ${sizeClasses[size]} ${isOpen ? "border-primary-deep ring-2 ring-primary/20" : ""}`}
          >
            <span className="truncate">
              {selected ? (
                <span className="flex items-center gap-2">
                  {selected.icon}
                  {selected.label}
                </span>
              ) : (
                <span className="text-text-muted">{placeholder}</span>
              )}
            </span>
            <svg
              className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Menu — rendered via portal */}
      {visible && (
        <Portal>
          <div
            ref={menuRef}
            style={floatingStyle}
            className={`max-h-60 overflow-y-auto rounded-xl border border-border-light bg-white py-1.5 shadow-xl ${closing ? 'animate-dropdown-out' : 'animate-dropdown'}`}
          >
            {renderOptions()}
          </div>
        </Portal>
      )}
    </div>
  );
}
