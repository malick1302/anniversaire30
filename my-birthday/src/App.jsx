import { useMemo, useState } from 'react'
import './App.css'
import EnvelopeOverlay from './components/EnvelopeOverlay'

// Charge toutes les images du dossier src/assets/photos (extensions : jpg, jpeg, png, gif, webp)
// On exclut 30.png, réservé au badge sur l'invite
const photoModules = import.meta.glob('./assets/photos/*.{jpg,jpeg,png,gif,webp}', { eager: true, as: 'url' })
const photoUrls = Object.values(photoModules)
  .map((m) => (typeof m === 'string' ? m : m?.default))
  .filter(Boolean)
  .filter((url) => !url.includes('30.png') && !url.includes('mbclown.png'))

// Chaque photo apparaît plusieurs fois pour tapisser tout l'écran (bords inclus)
const REPLICAS = 28
const photosForDisplay = photoUrls.flatMap((url) => Array(REPLICAS).fill(url))

// Générateur pseudo-aléatoire à seed fixe : même séquence à chaque chargement
function seededRandom(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}
const SEED = 12345

function App() {
  const [spinningId, setSpinningId] = useState(null)

  // Positions fixes : réparties sur tout l'écran et au-delà des bords pour bien tapisser (gauche, droite, etc.)
  const positions = useMemo(() => {
    const rng = seededRandom(SEED)
    return photosForDisplay.map(() => ({
      left: -30 + rng() * 116,   // -8% à 108% pour couvrir les bords
      top: -8 + rng() * 116,
      zIndex: Math.floor(rng() * 50) + 1,
      rotate: (rng() - 0.5) * 20,
    }))
  }, [])

  const handlePhotoClick = (index) => {
    if (spinningId !== null) return
    setSpinningId(index)
    setTimeout(() => setSpinningId(null), 600)
  }

  return (
    <div className="page">
      <EnvelopeOverlay />
      <div className="photos-layer">
        {photosForDisplay.map((url, index) => (
          <button
            key={index}
            type="button"
            className={`photo-thumb ${spinningId === index ? 'photo-spin' : ''}`}
            style={{
              left: `${positions[index]?.left ?? 0}%`,
              top: `${positions[index]?.top ?? 0}%`,
              zIndex: positions[index]?.zIndex ?? 1,
              transform: spinningId === index ? undefined : `rotate(${positions[index]?.rotate ?? 0}deg)`,
              '--start-deg': `${positions[index]?.rotate ?? 0}deg`,
            }}
            onClick={() => handlePhotoClick(index)}
          >
            <img src={url} alt="" width={50} height={50} />
          </button>
        ))}
      </div>
      {photoUrls.length === 0 && (
        <p className="placeholder-text">
          Ajoute des photos (jpg, png, gif, webp) dans <code>src/assets/photos/</code>, puis rafraîchis la page.
        </p>
      )}
    </div>
  )
}

export default App
