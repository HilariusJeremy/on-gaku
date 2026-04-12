import type { Measure } from "../App"

const Sidebar = ({selectedMeasure}: {selectedMeasure: Measure | null}) => {

    if (!selectedMeasure) return <p>Click a measure</p>
    return (
    <div className="sidebar">
        <h1>
            Sidebar
        </h1>
        <p>Treble</p>    
        <ul>
                {selectedMeasure.bass.map((note, index) => 
    typeof note === 'string' 
        ? <li key={index}>{note}</li>
        : <li key={index}>{note.pitch}</li>
)}
        </ul>
        <p> Bass</p>
        <ul>
                {selectedMeasure.bass.map((note, index) => 
    typeof note === 'string' 
        ? <li key={index}>{note}</li>
        : <li key={index}>{note.pitch}</li>
)}
        </ul>
    </div>
    )
}

export default Sidebar