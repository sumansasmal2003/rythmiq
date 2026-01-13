"use client";

import { usePlayer } from "@/lib/store";
import { X, GripVertical, Trash2, Pause, Play } from "lucide-react";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ArtistList } from "@/components/ArtistList";

export function QueueDrawer() {
  const {
    queue,
    activeSong,
    isQueueOpen,
    toggleQueue,
    reorderQueue,
    removeFromQueue,
    setActiveSong,
    isPlaying
  } = usePlayer();

  if (!isQueueOpen) return null;

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(queue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderQueue(items);
  };

  const isCurrent = (id: string) => activeSong?._id === id;

  return (
    <>
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
        onClick={toggleQueue}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 z-[70] w-full md:w-[450px] bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Up Next</h2>
            <p className="text-sm text-gray-500 font-medium">{queue.length} tracks queued</p>
          </div>
          <button
            onClick={toggleQueue}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="queue-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {queue.map((song, index) => {
                    const active = isCurrent(song._id);

                    return (
                      <Draggable key={song._id} draggableId={song._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 rounded-xl group transition-all
                                ${snapshot.isDragging ? "bg-white shadow-xl ring-2 ring-indigo-500 z-50 scale-105" : ""}
                                ${active ? "bg-indigo-50 border border-indigo-100" : "bg-white border border-gray-100 hover:border-indigo-200"}
                            `}
                          >
                            {/* Drag Handle */}
                            <div {...provided.dragHandleProps} className="text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1">
                                <GripVertical size={20} />
                            </div>

                            {/* Art */}
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer" onClick={() => setActiveSong(song)}>
                                <Image src={song.coverUrl} alt={song.name} fill className="object-cover" />
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                    {active && isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveSong(song)}>
                                <h4 className={`text-sm font-bold truncate ${active ? "text-indigo-600" : "text-gray-900"}`}>
                                    {song.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="text-xs text-gray-500 truncate">
                                        <ArtistList artists={song.artist} />
                                    </div>
                                    {song.mood && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider
                                            ${song.mood === 'Party' ? 'bg-purple-100 text-purple-600' :
                                              song.mood === 'Sad' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
                                        `}>
                                            {song.mood}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Remove Btn */}
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFromQueue(song._id); }}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                title="Remove from queue"
                            >
                                <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

      </div>
    </>
  );
}
