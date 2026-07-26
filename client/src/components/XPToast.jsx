import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePassport } from '../context/PassportContext.jsx'

export default function XPToast() {
  const { toasts } = usePassport()

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            aria-atomic="true"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,43,0.95) 0%, rgba(245,158,11,0.95) 100%)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              padding: '12px 20px',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 8px 32px rgba(255,107,43,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '220px',
              maxWidth: '320px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
