import { MENU_ITEM_CLASS } from "./menuStyles";
import { RemoveIcon } from "./RemoveIcon";

interface DirectoryContextMenuProps {
  menuKey: string;
  isOpen: boolean;
  onToggle: (key: string) => void;
  onRemove: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export function DirectoryContextMenu({
  menuKey,
  isOpen,
  onToggle,
  onRemove,
  menuRef,
}: DirectoryContextMenuProps) {
  return (
    <>
      <button
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/dir:opacity-100 flex items-center justify-center bg-transparent border-none cursor-pointer text-gh-text-secondary hover:text-gh-text rounded p-0.5 transition-opacity duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(menuKey);
        }}
        title="More actions"
      >
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-10 bg-gh-bg border border-gh-border rounded-md shadow-lg py-1 min-w-[160px]"
        >
          <button className={MENU_ITEM_CLASS} onClick={onRemove}>
            <RemoveIcon className="size-4" />
            Close
          </button>
        </div>
      )}
    </>
  );
}
