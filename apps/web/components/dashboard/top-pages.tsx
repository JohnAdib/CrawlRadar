import { BarList } from "@/components/dashboard/bar-list"
import { EmptyNote } from "@/components/dashboard/empty-note"
import type { Stats } from "@/lib/stats"

export function TopPages({
  pages,
  onSelect,
}: {
  pages: Stats["top_pages"]
  onSelect?: (page: string) => void
}) {
  if (pages.length === 0) return <EmptyNote>No pages in this range.</EmptyNote>
  return (
    <BarList
      rows={pages.map((p) => ({
        key: p.page_path ?? "",
        label: p.page_path || "(unknown page)",
        title: p.page_path ?? undefined,
        value: p.visits,
        mono: true,
        onSelect:
          onSelect && p.page_path
            ? () => onSelect(p.page_path as string)
            : undefined,
      }))}
    />
  )
}
