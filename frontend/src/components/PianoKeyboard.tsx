const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_KEYS: Record<string, number> = {
  'C#': 4.125, 'Db': 4.125,
  'D#': 9.25,  'Eb': 9.25,
  'F#': 16.125,'Gb': 16.125,
  'G#': 20.75, 'Ab': 20.75,
  'A#': 25.25, 'Bb': 25.25,
}
const WHITE_X: Record<string, number> = {
  'C': 2, 'D': 6, 'E': 10, 'F': 14, 'G': 18, 'A': 22, 'B': 26
}

interface PianoKeyboardProps { pitch: string | null }

const PianoKeyboard = ({ pitch }: PianoKeyboardProps) => {
  // Strip octave number: "Bb3" → "Bb", "C#4" → "C#"
  const noteName = pitch
  ? pitch.replace(/\d/g, '').replace('♭', 'b').replace('♯', '#')
  : null
  const isBlack = noteName ? noteName in BLACK_KEYS : false

  return (
    <svg viewBox="0 0 34 36" xmlns="http://www.w3.org/2000/svg" width="100%">
      <g stroke="#111" strokeWidth="0.125">
        {/* White keys */}
        {WHITE_KEYS.map((key) => (
          <rect key={key} x={WHITE_X[key]} y="2" width="4" height="30"
            fill={!isBlack && noteName === key ? '#4ade80' : '#eee'} />
        ))}
        {/* Black keys */}
        {Object.entries(BLACK_KEYS).filter(([k]) => !k.includes('b') || k === 'Bb').map(([key, x]) => (
          <rect key={key} x={x} y="2" width="2.5" height="20"
            fill={isBlack && noteName === key ? '#4ade80' : '#111'} />
        ))}
      </g>
    </svg>
  )
}

export default PianoKeyboard