import './Sidebar.css'
import type { Measure, Note } from "../App"
import PianoKeyboard from './PianoKeyboard'

const Sidebar = ({selectedMeasure, selectedNote, onSelectedNote}: 
    {selectedMeasure: Measure | null, selectedNote: Note | null, onSelectedNote: (note: Note, measure: Measure) => void}) => {
    if (!selectedMeasure) return <p className='sidebar'>Click a measure or a note!</p>
    return (
    <div className="sidebar">
        <h1>
            Sidebar
        </h1>
        <p>Treble</p>
        <ul>
        {selectedMeasure.notes.filter(n => n.track === 0).map((note) =>
            <div key={note.id}>
            <button onClick={() => onSelectedNote(note, selectedMeasure)}>
                {note.pitch}
            </button>
            {selectedNote?.id === note.id && <div><p>{note.pitch}</p> <PianoKeyboard pitch={note.pitch}/></div>}
            </div>
        )}
        </ul>
        <p>Bass</p>
        <ul>
        {selectedMeasure.notes.filter(n => n.track === 1).map((note) =>
            <div key={note.id}>
            <button onClick={() => onSelectedNote(note, selectedMeasure)}>
                {note.pitch}
            </button>
            {selectedNote?.id === note.id && <div><p>{note.pitch}</p> <PianoKeyboard pitch={note.pitch}/></div>}
            </div>
        )}
        </ul>
    </div>
    )
}

export default Sidebar