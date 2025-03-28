"use client"

import { useState, useEffect } from "react"

export function Toaster() {
  const [toasts, setToasts] = useState([])

  // Listen for toast events
  useEffect(() => {
    const handleToast = (event) => {
      const { title, description, variant = "default" } = event.detail

      const id = Date.now()
      setToasts((prev) => [...prev, { id, title, description, variant }])

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, 5000)
    }

    window.addEventListener("toast", handleToast)
    return () => window.removeEventListener("toast", handleToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.variant}`}>
          {toast.title && <h4>{toast.title}</h4>}
          {toast.description && <p>{toast.description}</p>}
          <button className="toast-close" onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

// Helper function to show toasts from anywhere in the app
export function toast({ title, description, variant = "default" }) {
  window.dispatchEvent(
    new CustomEvent("toast", {
      detail: { title, description, variant },
    }),
  )
}

export default Toaster