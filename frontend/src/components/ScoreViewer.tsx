import { useEffect, useState } from 'react';
import { useRef } from 'react';
import type { AnnotationData, Measure, Note } from '../App';
import './ScoreViewer.css';


const ScoreViewer = ({result, onSelectedMeasure, onSelectedNote, selectedMeasure, selectedNote}: 
    {result: AnnotationData|null, onSelectedMeasure: (measure: Measure) => void, onSelectedNote: (note: Note|null, measure: Measure) => void,
     selectedMeasure: Measure|null, selectedNote: Note|null
    }) => {
    const [scale, setScale] = useState(1)
    const imgRef = useRef<HTMLImageElement>(null)

    const handleLoad = () => {
    requestAnimationFrame(() => {
        if (!imgRef.current) return
        const natural = imgRef.current.naturalWidth
        const rendered = imgRef.current.getBoundingClientRect().width
        if (natural === 0) return
        setScale(rendered / natural)
    })
}

    useEffect(() => {
    handleLoad()
})

    if (!result) return null


    const measures = result['measures']
    const measure_bbox = measures.map(measure => <div 
            className={`measure-bbox ${measure.number===selectedMeasure?.number ? 'selected' : ''}`}
            style={{
                left: measure.bbox.x1*scale, top: measure.bbox.y1*scale, height: (measure.bbox.y2 - measure.bbox.y1)*scale,
                width: (measure.bbox.x2 - measure.bbox.x1)*scale
            }}
            key={measure.number}
            onClick={() => { onSelectedMeasure(measure)}}
            ></div>)

    const noteheads = measures.flatMap((measure) => [
        ...measure.treble.filter(note => typeof note !== 'string').map(note => ({note, measure})),
        ...measure.bass.filter(note => typeof note !== 'string').map(note => ({note, measure})),
    ])

    const note_bbox = noteheads.map(({note, measure}) => 
        <div className={`note-bbox ${selectedNote?.id===note.id ? 'selected' : ''}`}
            style={{
                left: note.bbox.x1*scale, top: note.bbox.y1*scale, height: (note.bbox.y2 - note.bbox.y1)*scale,
                width: (note.bbox.x2 - note.bbox.x1)*scale
            }}
            key={note.id}
            onClick={() => onSelectedNote(note, measure)}
            ></div>
    
    )

    return (
        <div className='score-viewer'>
            <img className='sheet-img' onLoad={handleLoad} src={result['img_url']} ref={imgRef}/>
            {measure_bbox}
            {note_bbox}
        </div>
    )
}

export default ScoreViewer