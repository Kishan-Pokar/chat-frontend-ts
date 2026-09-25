interface AvatarProps {
    name: string;
    size?: "sm" | "md";
    online?: boolean;
}

export default function Avatar({ name, size = "md", online }: AvatarProps) {
    const initial = name.charAt(0).toUpperCase();
    return (
        <div className={`avatar ${size === "sm" ? "avatar-sm" : ""}`}>
            {initial}
            {online !== undefined && (
                <span className={`presence-dot ${online ? "online" : "offline"}`} />
            )}
        </div>
    );
}