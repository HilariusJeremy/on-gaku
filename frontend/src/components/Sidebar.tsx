import type { Measure } from "../App"

const Sidebar = ({selectedMeasure}: {selectedMeasure: Measure}) => {
    console.log(selectedMeasure)
    if (!selectedMeasure) return
    return (
    <div>
        <h1>
            Sidebar
        </h1>
        <p>Treble</p>    
        <ul>
                {selectedMeasure.treble.map((note, index) => <li key={index}>{note}</li>)}
        </ul>
        <p> Bass</p>
        <ul>
                {selectedMeasure.bass.map((note, index) => <li key={index}>{note}</li>)}
        </ul>
    </div>
    )
}

export default Sidebar