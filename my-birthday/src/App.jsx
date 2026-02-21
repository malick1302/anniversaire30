import { useMemo, useState } from 'react'
import './App.css'

// Charge toutes les images du dossier assets/photos (ajoute tes photos dedans)
const photoModules = import.meta.glob('./assets/photos/*', { eager: true, as: 'url' })
const photoUrls = Object.values(photoModules).filter(Boolean)

function App() {
  const [spinningId, setSpinningId] = useState(null)

  // Positions et z-index aléatoires, calculés une seule fois au montage
  const positions = useMemo(() => {
    return photoUrls.map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      zIndex: Math.floor(Math.random() * 50) + 1,
      rotate: (Math.random() - 0.5) * 20,
    }))
  }, [])

  const handlePhotoClick = (index) => {
    if (spinningId !== null) return
    setSpinningId(index)
    setTimeout(() => setSpinningId(null), 600)
  }

  return (
    <div className="page">
      <div className="photos-layer">
        {photoUrls.map((url, index) => (
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
        <p className="placeholder-text">Ajoute des photos dans <code>src/assets/photos/</code></p>
      )}
    </div>
  )
}

export default App
