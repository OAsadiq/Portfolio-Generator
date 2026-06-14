import { useState } from 'react';
import { Layout, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { SectionItem } from '../builder.config';

interface Props {
  sections: SectionItem[];
  onToggle: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onReorder: (sections: SectionItem[]) => void;
}

export default function LayoutTab({ sections, onToggle, onMoveUp, onMoveDown, onReorder }: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!sections?.length) {
    return (
      <div className="py-12 text-center text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-xl">
        No sections available
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, i: number) => {
    setDraggedIndex(i);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== i) setDragOverIndex(i);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const next = [...sections];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, moved);
      onReorder(next.map((s, i) => ({ ...s, order: i })));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <Layout className="w-3.5 h-3.5" />Section Order
        </p>
        <p className="text-xs text-stone-400">Drag to reorder · eye icon to show/hide</p>
      </div>

      <div className="space-y-1.5">
        {sections.map((section, i) => {
          const visible = section.visible !== undefined ? section.visible : true;
          const isDragOver = dragOverIndex === i;

          return (
            <div key={section.id || i} draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, i)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={e => handleDrop(e, i)}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-move group ${
                visible
                  ? 'bg-white border-stone-200 hover:border-stone-300'
                  : 'bg-stone-50 border-stone-100 opacity-50'
              } ${isDragOver ? 'border-orange-300 bg-orange-50 scale-[1.01]' : ''}`}>

              <GripVertical className="w-4 h-4 text-stone-300 group-hover:text-stone-400 flex-shrink-0 transition" />

              <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0">
                <span className="text-stone-500 [&>svg]:w-3 [&>svg]:h-3">
                  {section.icon ?? <FileText className="w-3 h-3" />}
                </span>
              </div>

              <span className="flex-1 text-sm font-medium text-stone-700">{section.name || section.id}</span>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); onMoveUp(i); }} disabled={i === 0}
                  className="p-1 hover:bg-stone-100 rounded-lg disabled:opacity-20 transition">
                  <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                </button>
                <button onClick={e => { e.stopPropagation(); onMoveDown(i); }} disabled={i === sections.length - 1}
                  className="p-1 hover:bg-stone-100 rounded-lg disabled:opacity-20 transition">
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>
              </div>

              <button onClick={e => { e.stopPropagation(); onToggle(section.id); }}
                className="p-1 hover:bg-stone-100 rounded-lg transition flex-shrink-0"
                title={visible ? 'Hide section' : 'Show section'}>
                {visible
                  ? <Eye className="w-3.5 h-3.5 text-stone-400" />
                  : <EyeOff className="w-3.5 h-3.5 text-stone-300" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
        <p className="text-xs text-orange-600">
          <strong>Tip:</strong> Hidden sections won't appear on your live portfolio.
        </p>
      </div>
    </div>
  );
}
