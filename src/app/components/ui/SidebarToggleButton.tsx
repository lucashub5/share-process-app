import { FlipHorizontal } from "lucide-react";

interface Props {
    onToggle: () => void;
}
  
export default function SidebarToggleButton({ onToggle }: Props) {
    return (
        <button
            onClick={onToggle}
            className="hover:bg-gray-100 rounded-lg transition-colors opacity-60 hover:opacity-100"
            title="Toggle Sidebar"
        >
            <FlipHorizontal className="w-4 h-4" />
        </button>
    );
}  