import type { Measure } from "../App"

const Sidebar = ({selectedMeasure}: {selectedMeasure: Measure | null}) => {
    console.log(selectedMeasure)
    if (!selectedMeasure) return <p>Click a measure</p>
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