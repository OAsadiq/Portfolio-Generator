import { useState } from 'react';
import { Layout, Eye, GripVertical, ChevronUp, ChevronDown, FileText } from 'lucide-react';
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
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Layout className="w-4 h-4" />Section Order
        </h3>
        <div className="p-8 text-center bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-700">
          <p className="text-slate-400 mb-2">No sections available</p>
          <p className="text-xs text-slate-500">Sections will appear here once loaded</p>
        </div>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) setDragOverIndex(index);
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
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
          <Layout className="w-4 h-4" />Section Order
        </h3>
        <p className="text-xs text-slate-400">Drag to reorder, toggle eye to show/hide</p>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => {
          const isVisible = section.visible !== undefined ? section.visible : true;
          const isDragging = draggedIndex === i;
          const isDragOver = dragOverIndex === i;

          return (
            <div
              key={section.id || i}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, i)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={e => handleDrop(e, i)}
              className={`p-4 rounded-xl border-2 transition-all cursor-move group
                ${isVisible ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50 opacity-50'}
                ${isDragging ? 'opacity-40 scale-95' : ''}
                ${isDragOver ? 'border-yellow-400 scale-105 shadow-lg' : ''}
                hover:border-yellow-400/50 hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition cursor-grab" />
                <div className="w-8 h-8 p-2 rounded-lg flex items-center justify-center transition
                  bg-yellow-400/20 text-yellow-400 group-hover:bg-yellow-400/30">
                  {section.icon ?? <FileText className="w-4 h-4" />}
                </div>
                <span className="flex-1 font-bold text-sm">{section.name || section.id}</span>
                <div className="flex items-center gap-1">
                  <button onClick={e => { e.stopPropagation(); onMoveUp(i); }} disabled={i === 0}
                    className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); onMoveDown(i); }} disabled={i === sections.length - 1}
                    className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); onToggle(section.id); }}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                    title={isVisible ? 'Hide section' : 'Show section'}>
                    <Eye className={`w-4 h-4 ${isVisible ? 'text-green-400' : 'text-slate-600'}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300 flex items-start gap-2">
          <span>💡</span>
          <span><strong>Tip:</strong> Drag to reorder or use the arrows for fine control. Hidden sections won't appear on your live portfolio.</span>
        </p>
      </div>
    </div>
  );
}
