import type { Measure, Note } from "../App"
import PianoKeyboard from './PianoKeyboard'

const Sidebar = ({selectedMeasure, selectedNote, onSelectedNote}: 
    {selectedMeasure: Measure | null, selectedNote: Note | null, onSelectedNote: (note: Note, measure: Measure) => void}) => {
    if (!selectedMeasure) return (
        <div className="w-full lg:w-80 bg-[#0c200d] flex items-center justify-center p-8 shrink-0">
            <p className="text-[#9cd768]/40 font-[Manrope] text-xs tracking-widest uppercase text-center">
                Click a measure to begin
            </p>
        </div>
    )
    return (
     <div className="w-full lg:w-80 bg-[#0c200d] overflow-y-auto p-6 shrink-0 border-t lg:border-t-0 lg:border-l border-[#e6c365]/10">
            <p className="text-[#e6c365]/50 font-[Manrope] text-xs tracking-widest uppercase mb-4">Treble</p>
            <ul className="flex flex-col gap-2 mb-6">
                {selectedMeasure.notes.filter(n => n.track === 0).map((note) =>
                    <div key={note.id} className="flex flex-col">
                        <button 
                            onClick={() => onSelectedNote(note, selectedMeasure)}
                            className={`cursor-pointer text-left px-3 py-2 font-[Manrope] text-sm tracking-wider transition-all
                                ${selectedNote?.id === note.id 
                                    ? 'text-[#9cd768] bg-[#253a25]' 
                                    : 'text-[#e6c365]/70 hover:text-[#e6c365] hover:bg-[#253a25]/50'}`}>
                            {note.pitch}
                        </button>
                        {selectedNote?.id === note.id && 
                            <div className="px-3 py-2 bg-[#041706]">
                                <PianoKeyboard pitch={note.pitch}/>
                            </div>}
                    </div>
                )}
            </ul>

            <p className="text-[#e6c365]/50 font-[Manrope] text-xs tracking-widest uppercase mb-4">Bass</p>
            <ul className="flex flex-col gap-2">
                {selectedMeasure.notes.filter(n => n.track === 1).map((note) =>
                    <div key={note.id} className="flex flex-col">
                        <button 
                            onClick={() => onSelectedNote(note, selectedMeasure)}
                            className={`cursor-pointer text-left px-3 py-2 font-[Manrope] text-sm tracking-wider transition-all
                                ${selectedNote?.id === note.id 
                                    ? 'text-[#9cd768] bg-[#253a25]' 
                                    : 'text-[#e6c365]/70 hover:text-[#e6c365] hover:bg-[#253a25]/50'}`}>
                            {note.pitch}
                        </button>
                        {selectedNote?.id === note.id && 
                            <div className="px-3 py-2 bg-[#041706]">
                                <PianoKeyboard pitch={note.pitch}/>
                            </div>}
                    </div>
                )}
            </ul>
        </div>
    )
}

export default Sidebar