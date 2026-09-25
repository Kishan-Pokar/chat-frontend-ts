export function toMs(timestamp: string | number): number {
    return typeof timestamp === "string" ? Number(timestamp) : timestamp;
}

export function formatMessageTime(timestamp: string | number): string {
    const date = new Date(toMs(timestamp));
    return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function formatDayLabel(timestamp: string | number): string {
    const date = new Date(toMs(timestamp));
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
}