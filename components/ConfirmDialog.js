"use client";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="ih-confirm-backdrop">
      <div className="ih-confirm-box">
        <div className="ih-confirm-header">
          <h5>{title}</h5>
        </div>

        <div className="ih-confirm-body">
          {message}
        </div>

        <div className="ih-confirm-actions">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-orange btn-sm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}