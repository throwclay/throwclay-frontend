// Custom 3x3 grid component
export const AppGridIcon = ({ className }: { className?: string; }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        {/* Row 1 */}
        <rect
            x="1"
            y="1"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />
        <rect
            x="6.5"
            y="1"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />
        <rect
            x="12"
            y="1"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />

        {/* Row 2 */}
        <rect
            x="1"
            y="6.5"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />
        <rect
            x="6.5"
            y="6.5"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />
        <rect
            x="12"
            y="6.5"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />

        {/* Row 3 */}
        <rect
            x="1"
            y="12"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />
        <rect
            x="6.5"
            y="12"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />
        <rect
            x="12"
            y="12"
            width="3"
            height="3"
            rx="0.5"
            fill="currentColor" />
    </svg>
);
