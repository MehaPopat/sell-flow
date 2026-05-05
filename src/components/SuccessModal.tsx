interface SuccessModalProps {
  title: string;
  body: string;
  onClose: () => void;
}

export function SuccessModal({ title, body, onClose }: SuccessModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[70]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto px-8 py-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl font-bold">
            ✓
          </div>
          <div>
            <h2 className="font-semibold text-base text-green-700">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{body}</p>
          </div>
          <button
            onClick={onClose}
            className="action-btn action-btn-primary w-full py-3 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
