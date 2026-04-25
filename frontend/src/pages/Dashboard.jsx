import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCollections } from '../context/CollectionContext.jsx';
import { CollectionTree } from '../components/Sidebar/CollectionTree.jsx';
import { EnvironmentSelector } from '../components/Sidebar/EnvironmentSelector.jsx';
import { RequestBuilder } from '../components/RequestBuilder/RequestBuilder.jsx';
import { ResponseViewer } from '../components/ResponseViewer/ResponseViewer.jsx';
import { useRequest } from '../hooks/useRequest.js';
import { useVariableMap } from '../hooks/useEnvironment.js';
import { draftToSavePayload, emptyDraft, historyToDraft, requestToDraft } from '../utils/requestDraft.js';

export function Dashboard() {
  const { user, logout } = useAuth();
  const { collections, loading, createCollection, updateCollection, deleteCollection, shareCollection, getCollection } =
    useCollections();
  const variableMap = useVariableMap();
  const { execute, loading: sending, response, error, clear } = useRequest();

  const [collectionId, setCollectionId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [newColName, setNewColName] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const replay = location.state?.replay;
    if (!replay) return;
    setDraft(historyToDraft(replay));
    setSelectedRequestId(null);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  const reloadDetail = useCallback(async () => {
    if (!collectionId) {
      setDetail(null);
      return;
    }
    const data = await getCollection(collectionId);
    setDetail(data.collection);
  }, [collectionId, getCollection]);

  useEffect(() => {
    let cancelled = false;
    reloadDetail()
      .catch(() => {
        if (!cancelled) setDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadDetail]);

  async function handleCreateCollection(e) {
    e.preventDefault();
    if (!newColName.trim()) return;
    const col = await createCollection(newColName.trim());
    setNewColName('');
    setCollectionId(col._id);
  }

  function onSelectRequest(req) {
    const id = typeof req === 'object' && req?._id ? String(req._id) : String(req);
    setSelectedRequestId(id);
    setDraft(requestToDraft(typeof req === 'object' ? req : null));
    clear();
  }

  async function handleNewRequest() {
    if (!collectionId) return;
    setBusy(true);
    try {
      await api(`/api/collections/${collectionId}/requests`, {
        method: 'POST',
        body: { ...draftToSavePayload({ ...emptyDraft, name: 'New request' }), folderIndex: 0 },
      });
      await reloadDetail();
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!draft._id) return;
    setBusy(true);
    try {
      await api(`/api/requests/${draft._id}`, { method: 'PUT', body: draftToSavePayload(draft) });
      await reloadDetail();
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    await execute(draft, variableMap);
  }

  async function onUpdateFolders(folders) {
    if (!collectionId) return;
    await updateCollection(collectionId, { folders });
    await reloadDetail();
  }

  async function onDuplicate(id) {
    await api(`/api/requests/${id}/duplicate`, { method: 'POST' });
    await reloadDetail();
  }

  async function onDeleteRequest(id) {
    if (!window.confirm('Delete this request?')) return;
    await api(`/api/requests/${id}`, { method: 'DELETE' });
    if (selectedRequestId === id) {
      setSelectedRequestId(null);
      setDraft(emptyDraft);
    }
    await reloadDetail();
  }

  async function handleShare() {
    if (!collectionId) return;
    try {
      const data = await shareCollection(collectionId);
      const url = `${window.location.origin}/share/${data.shareToken}`;
      await navigator.clipboard.writeText(url);
      setShareMsg('Share link copied to clipboard.');
      setTimeout(() => setShareMsg(''), 4000);
    } catch {
      setShareMsg('Could not create share link.');
    }
  }

  async function handleAddFolder() {
    if (!detail) return;
    const n = detail.folders.length + 1;
    const folders = detail.folders.map((f) => ({
      _id: f._id,
      name: f.name,
      requests: (f.requests || []).map((r) => (r && r._id ? r._id : r)),
    }));
    folders.push({ name: `Folder ${n}`, requests: [] });
    await updateCollection(collectionId, { folders });
    await reloadDetail();
  }

  async function handleDeleteCollection() {
    if (!collectionId || !window.confirm('Delete this collection and all requests?')) return;
    await deleteCollection(collectionId);
    setCollectionId(null);
    setDetail(null);
    setSelectedRequestId(null);
    setDraft(emptyDraft);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontWeight: 700 }}>API Client</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>{user?.email}</span>
          <Link to="/history">History</Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside
          style={{
            width: 300,
            maxWidth: '40vw',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
            <form onSubmit={handleCreateCollection} style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <input className="input" placeholder="New collection" value={newColName} onChange={(e) => setNewColName(e.target.value)} />
              <button type="submit" className="btn" disabled={loading}>
                Create
              </button>
            </form>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Active collection</label>
            <select
              className="input"
              style={{ marginTop: 4, marginBottom: 8 }}
              value={collectionId || ''}
              onChange={(e) => {
                setCollectionId(e.target.value || null);
                setSelectedRequestId(null);
                setDraft(emptyDraft);
                clear();
              }}
            >
              <option value="">— Select —</option>
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {collectionId && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                <button type="button" className="btn" disabled={busy} onClick={handleNewRequest}>
                  New request
                </button>
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={handleAddFolder}>
                  Add folder
                </button>
                <button type="button" className="btn btn-ghost" disabled={busy} onClick={handleShare}>
                  Share
                </button>
                <button type="button" className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={handleDeleteCollection}>
                  Delete collection
                </button>
              </div>
            )}
            {shareMsg && <p style={{ fontSize: 13, color: 'var(--success)', margin: '0 0 8px' }}>{shareMsg}</p>}
            <CollectionTree
              collection={detail}
              selectedRequestId={selectedRequestId}
              onSelectRequest={onSelectRequest}
              onUpdateFolders={onUpdateFolders}
              onDuplicate={onDuplicate}
              onDeleteRequest={onDeleteRequest}
              readOnly={false}
            />
          </div>
          <EnvironmentSelector />
        </aside>
        <main style={{ flex: 1, padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RequestBuilder
            draft={draft}
            onChange={setDraft}
            onSend={handleSend}
            onSave={handleSave}
            sending={sending}
            readOnly={false}
            canSave={Boolean(draft._id)}
          />
          <ResponseViewer response={response} error={error} />
        </main>
      </div>
    </div>
  );
}
