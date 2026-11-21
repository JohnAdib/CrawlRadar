import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { BrandLogo } from "@/components/brand-logo"

// Platforms and their assistants, Chinese AI labs included; the last three have no logo.
const NAMES = [
  ...["OpenAI", "ChatGPT", "Anthropic", "Claude", "Google", "Gemini"],
  ...["Perplexity", "Meta", "Microsoft", "Copilot", "Apple", "Amazon"],
  ...["xAI", "Grok", "Mistral", "Le Chat", "Cohere", "Bytedance", "Doubao"],
  ...["DeepSeek", "Alibaba", "Qwen", "Moonshot AI", "Kimi", "Baidu", "ERNIE"],
  ...["Tencent", "Yuanbao", "Zhipu AI", "ChatGLM", "Huawei", "MiniMax"],
  ...["Common Crawl", "DuckDuckGo", "Unknown"],
]

const meta = {
  title: "Components/BrandLogo",
  component: BrandLogo,
  args: { name: "DeepSeek" },
} satisfies Meta<typeof BrandLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = { args: { className: "size-8" } }

/** Brands without a logo get a coloured initial; "Unknown" gets a question mark. */
export const NoLogo: Story = {
  args: { name: "Common Crawl", className: "size-8" },
}

export const Grid: Story = {
  render: () => (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-2">
      {NAMES.map((name) => (
        <li
          key={name}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <BrandLogo name={name} className="size-5" /> {name}
        </li>
      ))}
    </ul>
  ),
}
