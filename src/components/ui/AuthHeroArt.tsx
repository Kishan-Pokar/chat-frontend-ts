export default function AuthHeroArt() {
    return (
        <svg
            className="auth-hero-art"
            viewBox="0 0 400 500"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="cubeTopLit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F0B473" />
                    <stop offset="100%" stopColor="#C97A3B" />
                </linearGradient>
                <linearGradient id="cubeRightLit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8A5E38" />
                    <stop offset="100%" stopColor="#54391F" />
                </linearGradient>
                <linearGradient id="cubeLeftLit" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3A4A66" />
                    <stop offset="100%" stopColor="#242E45" />
                </linearGradient>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
                </radialGradient>
                <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="10" />
                </filter>
            </defs>

            {/* small back cube, unlit */}
            <g transform="translate(95,120)" opacity="0.85">
                <polygon points="0,-38 44,-19 0,0 -44,-19" fill="#334360" />
                <polygon points="0,0 44,-19 44,19 0,38" fill="#1B2739" />
                <polygon points="0,0 -44,-19 -44,19 0,38" fill="#28374F" />
            </g>

            {/* glow orbs */}
            <circle cx="270" cy="140" r="46" fill="url(#glow)" filter="url(#soften)" />
            <circle cx="270" cy="140" r="11" fill="#FDE68A" />
            <circle cx="66" cy="310" r="38" fill="url(#glow)" filter="url(#soften)" />
            <circle cx="66" cy="310" r="9" fill="#FDE68A" />

            {/* main lit cube */}
            <g transform="translate(215,250)">
                <polygon points="0,-72 82,-36 0,0 -82,-36" fill="url(#cubeTopLit)" />
                <polygon points="0,0 82,-36 82,36 0,72" fill="url(#cubeRightLit)" />
                <polygon points="0,0 -82,-36 -82,36 0,72" fill="url(#cubeLeftLit)" />
            </g>

            {/* fallen cube, bottom right */}
            <g transform="translate(305,410) rotate(18)" opacity="0.9">
                <polygon points="0,-28 32,-14 0,0 -32,-14" fill="#3A4A66" />
                <polygon points="0,0 32,-14 32,14 0,28" fill="#1B2739" />
                <polygon points="0,0 -32,-14 -32,14 0,28" fill="#28374F" />
            </g>
        </svg>
    );
}