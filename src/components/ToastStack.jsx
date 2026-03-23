import { useToast } from '../context/ToastContext'

function ToastStack() {
  const { toasts, dismissToast, runToastAction } = useToast()

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast toast--${toast.tone || 'info'}`}>
          <div className="toast__content">
            <strong>{toast.title}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </div>
          <div className="toast__actions">
            {toast.actionLabel ? (
              <button type="button" className="toast__action" onClick={() => runToastAction(toast.id)}>
                {toast.actionLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="toast__dismiss"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
            >
              ×
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default ToastStack
