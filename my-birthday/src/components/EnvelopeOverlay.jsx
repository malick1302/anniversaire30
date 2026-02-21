import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import envcloseUrl from '../assets/enveloppe/envclose.png'
import envopenUrl from '../assets/enveloppe/envopen.png'
import open1Url from '../assets/enveloppe/open1.png'
import open2Url from '../assets/enveloppe/open2.png'
import open3Url from '../assets/enveloppe/open3.png'
import inviteUrl from '../assets/enveloppe/invite.png'
import './EnvelopeOverlay.css'

const TEXT = 'Clique sur l\'enveloppe'

// Séquence après le clic : envopen → open1 → open2 → open3 → invite (style GIF, rapide)
const OPEN_SEQUENCE = [envopenUrl, open1Url, open2Url, open3Url, inviteUrl]
const FRAME_DURATION_MS = 180 // ms par image
const INVITE_EXPAND_DELAY_MS = 400 // délai avant de lancer l'agrandissement
const INVITE_EXPAND_STEP_MS = 120 // ms entre chaque étape (saccadé)

function EnvelopeOverlay() {
  const wrapRef = useRef(null)
  const textRef = useRef(null)
  const openWrapRef = useRef(null)
  const [error, setError] = useState(false)
  const [letters, setLetters] = useState([])
  const [isOpened, setIsOpened] = useState(false)
  const [openStep, setOpenStep] = useState(0)
  const [expandStep, setExpandStep] = useState(0) // 0 = pas d'agrandissement, 1-4 = étapes invite

  useEffect(() => {
    setLetters(TEXT.split(''))
  }, [])

  useEffect(() => {
    if (isOpened) return
    const wrap = wrapRef.current
    if (!wrap) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap,
        { y: -200, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.6, ease: 'power2.out', overwrite: true }
      )
    })
    return () => ctx.revert()
  }, [isOpened])

  useEffect(() => {
    if (isOpened || letters.length === 0) return
    const spans = textRef.current?.querySelectorAll('.envclose-letter')
    if (!spans?.length) return
    const tween = gsap.fromTo(
      spans,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, delay: 1.5, ease: 'power2.out' }
    )
    return () => tween.kill()
  }, [letters.length, isOpened])

  useEffect(() => {
    if (!isOpened) return
    const el = openWrapRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }
    )
  }, [isOpened])

  // Séquence type GIF : changement d’image sans effet, rapide
  useEffect(() => {
    if (!isOpened || openStep >= OPEN_SEQUENCE.length - 1) return
    const t = setTimeout(() => {
      setOpenStep((s) => Math.min(s + 1, OPEN_SEQUENCE.length - 1))
    }, FRAME_DURATION_MS)
    return () => clearTimeout(t)
  }, [isOpened, openStep])

  // Agrandissement invite en 4 étapes saccadées → 20px de marge, centré
  useEffect(() => {
    if (!isOpened || openStep !== OPEN_SEQUENCE.length - 1) return
    const t0 = setTimeout(() => setExpandStep(1), INVITE_EXPAND_DELAY_MS)
    const t1 = setTimeout(() => setExpandStep(2), INVITE_EXPAND_DELAY_MS + INVITE_EXPAND_STEP_MS)
    const t2 = setTimeout(() => setExpandStep(3), INVITE_EXPAND_DELAY_MS + INVITE_EXPAND_STEP_MS * 2)
    const t3 = setTimeout(() => setExpandStep(4), INVITE_EXPAND_DELAY_MS + INVITE_EXPAND_STEP_MS * 3)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [isOpened, openStep])

  const handleEnvelopeClick = () => {
    const wrap = wrapRef.current
    if (!wrap) {
      setIsOpened(true)
      return
    }
    gsap.to(wrap, {
      opacity: 0,
      scale: 0.9,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => setIsOpened(true)
    })
  }

  const overlay = (
    <div className="envclose-overlay" aria-hidden="true">
      <div className="envclose-content">
        {!isOpened ? (
          <button
            type="button"
            className="envclose-wrap envclose-wrap--clickable"
            ref={wrapRef}
            onClick={handleEnvelopeClick}
            aria-label="Ouvrir l’enveloppe"
          >
            {error ? (
              <p className="envclose-fallback">Image envclose.png introuvable.</p>
            ) : (
              <img
                src={envcloseUrl}
                alt=""
                className="envclose-img"
                onError={() => setError(true)}
              />
            )}
            <p className="envclose-text" ref={textRef} aria-hidden="true">
              {letters.map((char, i) => (
                <span key={i} className="envclose-letter">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </p>
          </button>
        ) : (
          <div className="envclose-open-wrap" ref={openWrapRef}>
            <div
              className={`envclose-open-inner${expandStep > 0 ? ` envclose-open-inner--expand-${expandStep}` : ''}`}
            >
              <img src={OPEN_SEQUENCE[openStep]} alt="" className="envclose-open-img" />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : null
}

export default EnvelopeOverlay
