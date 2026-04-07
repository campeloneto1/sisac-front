"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between rounded-2xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  withSearch?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  viewportProps?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Viewport>;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join(" ");
  }

  if (React.isValidElement(node)) {
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }

  return "";
}

function filterSelectNodes(node: React.ReactNode, search: string): React.ReactNode {
  if (!search) {
    return node;
  }

  if (Array.isArray(node)) {
    return node
      .map((child, index) => {
        const filtered = filterSelectNodes(child, search);

        if (filtered === null) {
          return null;
        }

        return <React.Fragment key={index}>{filtered}</React.Fragment>;
      })
      .filter(Boolean);
  }

  if (!React.isValidElement(node)) {
    return node;
  }

  const element = node as React.ReactElement<{
    children?: React.ReactNode;
    value?: string;
    className?: string;
  }>;

  const isSelectItem = typeof element.props.value === "string";

  if (isSelectItem) {
    const text = extractText(element.props.children).toLocaleLowerCase();

    if (!text.includes(search)) {
      return null;
    }

    return element;
  }

  if (!element.props.children) {
    return element;
  }

  return React.cloneElement(element, {
    ...element.props,
    children: filterSelectNodes(element.props.children, search),
  });
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", withSearch = true, searchPlaceholder = "Buscar...", emptyMessage = "Nenhuma opcao encontrada.", viewportProps, ...props }, ref) => {
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredChildren = React.useMemo(() => {
    if (!withSearch) {
      return children;
    }

    return filterSelectNodes(children, normalizedSearch);
  }, [children, normalizedSearch, withSearch]);
  const hasResults =
    Array.isArray(filteredChildren) ? filteredChildren.some(Boolean) : Boolean(filteredChildren);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        onCloseAutoFocus={(event) => {
          setSearch("");
          props.onCloseAutoFocus?.(event);
        }}
        {...props}
      >
        {withSearch ? (
          <div className="border-b border-slate-200 p-2">
            <input
              ref={inputRef}
              autoFocus
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              onKeyDown={(event) => event.stopPropagation()}
              onKeyDownCapture={(event) => event.stopPropagation()}
              onKeyUpCapture={(event) => event.stopPropagation()}
              placeholder={searchPlaceholder}
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-slate-400 focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        ) : null}
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          {...viewportProps}
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
            viewportProps?.className,
          )}
        >
          {hasResults ? filteredChildren : <div className="px-3 py-4 text-sm text-slate-500">{emptyMessage}</div>}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-xl py-2 pl-8 pr-2 text-sm outline-none focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
