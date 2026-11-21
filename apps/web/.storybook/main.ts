import type { StorybookConfig } from "@storybook/nextjs-vite"
import { mergeConfig } from "vite"

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.tsx"],
  framework: "@storybook/nextjs-vite",
  core: { disableTelemetry: true },
  // Platform logos (BrandLogo) are served from public/logos.
  staticDirs: ["../public"],
  viteFinal: (vite) =>
    mergeConfig(vite, {
      // Vite reloads on any .html change; Next and Storybook builds write lots of them.
      server: { watch: { ignored: ["**/.next/**", "**/storybook-static/**"] } },
      build: {
        rolldownOptions: {
          // "use client" means nothing in a static bundle; Radix alone warns ~50 times.
          onwarn(warning: { code?: string }, warn: (w: unknown) => void) {
            if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning)
          },
        },
      },
    }),
}

export default config
