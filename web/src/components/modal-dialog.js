import React from 'react'

import styles from './modal-dialog.css'

export function ModalDialog({title, children, open, onClose}) {
  return open && <div className={styles.modal}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <span className={styles.modalTitle}>{title}</span>
        <span className={styles.modalCloseButton} onClick={onClose}>&#10006;</span>
      </div>
      <div className={styles.modalBody}>{children}</div>
    </div>
  </div>
}
