export function URLInput({ value, onChange, disabled, onSend }) {
  return (
    <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
      <input
        className="input mono"
        placeholder="{{baseUrl}}/path"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSend) onSend();
        }}
        style={{ flex: 1 }}
      />
    </div>
  );
}
