export class ShopPostResource {
    static toResource(row: any) {
        const content = row.content;
        const caption =
            content && typeof content === "object" && !Array.isArray(content) && "caption" in content
                ? String((content as Record<string, unknown>).caption ?? "")
                : "";

        const rawMedia = row.media;
        const images = Array.isArray(rawMedia) ? rawMedia : [];

        return {
            id: row.id,
            caption,
            images,
            shop: row.shop ?? null,
            viewCount: row.viewCount ?? 0,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}
