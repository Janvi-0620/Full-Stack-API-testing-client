import { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function rid(r) {
  return typeof r === 'object' && r?._id ? String(r._id) : String(r);
}

function rname(r) {
  return typeof r === 'object' && r?.name ? r.name : 'Request';
}

function RequestRow({ req, selectedRequestId, readOnly, onSelectRequest, onDuplicate, onDeleteRequest, dragHandleProps, innerRef, style }) {
  const id = rid(req);
  return (
    <div
      ref={innerRef}
      style={{
        ...style,
        marginBottom: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: selectedRequestId === id ? 'var(--surface2)' : 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '6px 8px',
      }}
    >
      {!readOnly && dragHandleProps && (
        <span {...dragHandleProps} style={{ cursor: 'grab', color: 'var(--muted)', userSelect: 'none' }}>
          ⋮⋮
        </span>
      )}
      <button
        type="button"
        className="btn btn-ghost"
        style={{
          flex: 1,
          textAlign: 'left',
          border: 'none',
          padding: '4px 6px',
          background: 'transparent',
          color: 'var(--text)',
        }}
        onClick={() => onSelectRequest(req)}
      >
        {rname(req)}
      </button>
      {!readOnly && (
        <>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '2px 6px', fontSize: 12 }}
            onClick={() => onDuplicate(id)}
          >
            Dup
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '2px 6px', fontSize: 12, color: 'var(--danger)' }}
            onClick={() => onDeleteRequest(id)}
          >
            Del
          </button>
        </>
      )}
    </div>
  );
}

export function CollectionTree({
  collection,
  selectedRequestId,
  onSelectRequest,
  onUpdateFolders,
  onDuplicate,
  onDeleteRequest,
  readOnly,
}) {
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const searching = Boolean(term);

  const matches = useMemo(() => {
    if (!collection?.folders || !searching) return [];
    const rows = [];
    for (let fi = 0; fi < collection.folders.length; fi++) {
      const folder = collection.folders[fi];
      for (const req of folder.requests || []) {
        if (rname(req).toLowerCase().includes(term)) rows.push({ fi, folder, req });
      }
    }
    return rows;
  }, [collection, searching, term]);

  async function onDragEnd(result) {
    if (readOnly || !result.destination || !collection) return;
    const srcF = Number(String(result.source.droppableId).replace('folder-', ''));
    const dstF = Number(String(result.destination.droppableId).replace('folder-', ''));
    const folders = collection.folders.map((f) => ({
      _id: f._id,
      name: f.name,
      requests: (f.requests || []).map((r) => rid(r)),
    }));
    const [moved] = folders[srcF].requests.splice(result.source.index, 1);
    folders[dstF].requests.splice(result.destination.index, 0, moved);
    await onUpdateFolders(folders);
  }

  if (!collection) {
    return <p style={{ color: 'var(--muted)', padding: 12 }}>Select or create a collection.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        className="input"
        placeholder="Search requests…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {searching && (
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
          Reordering is disabled while searching. Clear the box to drag requests.
        </p>
      )}
      {searching ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {matches.map(({ req, folder }) => (
            <li key={rid(req)}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{folder.name}</div>
              <RequestRow
                req={req}
                selectedRequestId={selectedRequestId}
                readOnly={readOnly}
                onSelectRequest={onSelectRequest}
                onDuplicate={onDuplicate}
                onDeleteRequest={onDeleteRequest}
              />
            </li>
          ))}
          {!matches.length && <li style={{ color: 'var(--muted)', fontSize: 13 }}>No matches.</li>}
        </ul>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {collection.folders.map((folder, fi) => (
            <div key={folder._id || fi}>
              <div style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0' }}>{folder.name}</div>
              <Droppable droppableId={`folder-${fi}`} isDropDisabled={readOnly}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {(folder.requests || []).map((req, index) => (
                      <Draggable key={rid(req)} draggableId={rid(req)} index={index} isDragDisabled={readOnly}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.9 : 1,
                            }}
                          >
                            <RequestRow
                              req={req}
                              selectedRequestId={selectedRequestId}
                              readOnly={readOnly}
                              onSelectRequest={onSelectRequest}
                              onDuplicate={onDuplicate}
                              onDeleteRequest={onDeleteRequest}
                              dragHandleProps={dragProvided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      )}
    </div>
  );
}
