// Design System Tokens
// This file centralizes all design decisions for the Pride History Archive

// Typography
export const typography = {
  fontFamily: "Inter, sans-serif",
  headings: {
    h1: "text-3xl font-bold tracking-tight",
    h2: "text-2xl font-semibold tracking-tight",
    h3: "text-xl font-semibold tracking-tight",
    h4: "text-lg font-medium",
  },
  body: {
    default: "text-base",
    small: "text-sm",
    tiny: "text-xs",
  },
}

// Spacing
export const spacing = {
  section: "space-y-6",
  card: "space-y-4",
  formField: "space-y-2",
  buttonGroup: "space-x-2",
  pageWrapper: "p-4 md:p-8",
  cardPadding: "p-6",
}

// Component Specific
export const components = {
  pageHeader: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8",
  pageTitle: "text-3xl font-bold tracking-tight",
  pageDescription: "text-muted-foreground",
  card: "rounded-lg border bg-card text-card-foreground shadow-sm",
  form: "space-y-6",
  formSection: "space-y-4",
  formLabel: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
}

// Consistent button sizes
export const buttonSizes = {
  icon: "h-9 w-9",
  sm: "h-8 px-3 text-xs",
  default: "h-9 px-4 py-2",
  lg: "h-10 px-8",
}

