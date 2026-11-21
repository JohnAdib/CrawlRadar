import "@crawlradar/ui/globals.css"

import { Toaster } from "@crawlradar/ui/components/sonner"
import { TooltipProvider } from "@crawlradar/ui/components/tooltip"
import type { Preview } from "@storybook/nextjs-vite"

const preview: Preview = {
  parameters: {
    nextjs: { appDirectory: true },
    layout: "padded",
  },
  globalTypes: {
    theme: {
      description: "Light or dark theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    // Same shell as app/layout.tsx; the app's next-themes uses the "dark" class on <html>.
    (Story, { globals }) => {
      const theme = globals.theme === "dark" ? "dark" : "light"
      document.documentElement.classList.toggle("dark", theme === "dark")
      return (
        <TooltipProvider>
          <Story />
          <Toaster theme={theme} />
        </TooltipProvider>
      )
    },
  ],
}

export default preview
