import { createPortal } from 'react-dom'
import './InviteActions.css'

function InviteActions({ visible }) {
  if (!visible) return null

  const actions = (
    <div className="invite-actions-container" role="group" aria-label="Réponse à l’invitation">
      <a
        href="https://forms.fillout.com/t/r4n2RcuQpdus"
        target="_blank"
        rel="noopener noreferrer"
        className="invite-actions-btn"
      >
        Tu viens ?
      </a>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(actions, document.body) : null
}

export default InviteActions
