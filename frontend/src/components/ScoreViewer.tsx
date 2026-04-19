import { useEffect, useState } from 'react';
import { useRef } from 'react';
import type { AnnotationData, Measure, Note } from '../App';
import { API_URL } from '../api'


const ScoreViewer = ({result, onSelectedMeasure, onSelectedNote, selectedMeasure, selectedNote}: 
    {result: AnnotationData|null, onSelectedMeasure: (measure: Measure) => void, onSelectedNote: (note: Note|null, measure: Measure) => void,
     selectedMeasure: Measure|null, selectedNote: Note|null
    }) => {
    const [scale, setScale] = useState(1)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (!imgRef.current) return
        const observer = new ResizeObserver(() => {
            if (!imgRef.current) return
            const natural = imgRef.current.naturalWidth
            const rendered = imgRef.current.getBoundingClientRect().width
            if (natural === 0 || rendered === 0) return
            setScale(rendered / natural)
        })
        observer.observe(imgRef.current)
        return () => observer.disconnect()
    }, [result])

    if (!result) return null


    const measures = result['measures']
    const measure_bbox = measures.map(measure => <div 
            className={`absolute cursor-pointer border transition-all duration-150
            ${measure.number===selectedMeasure?.number 
                ? 'bg-[#e6c365]/30 border-[#e6c365]/60' 
                : 'bg-transparent border-transparent hover:bg-[#e6c365]/10 hover:border-[#e6c365]/30'}`}
            style={{
                left: measure.bbox.x1*scale, top: measure.bbox.y1*scale, height: (measure.bbox.y2 - measure.bbox.y1)*scale,
                width: (measure.bbox.x2 - measure.bbox.x1)*scale
            }}
            key={measure.number}
            onClick={() => { onSelectedMeasure(measure)}}
            ></div>)

    const noteheads = measures.flatMap((measure) => [
        ...measure.notes.filter(note => typeof note !== 'string').map(note => ({note, measure})),
    ])

    const note_bbox = noteheads.map(({note, measure}) => 
        <div className={`absolute cursor-pointer border transition-all duration-150 z-10
            ${selectedNote?.id===note.id 
                ? 'bg-[#9cd768]/70 border-[#9cd768]/60' 
                : 'bg-transparent border-transparent hover:bg-[#9cd768]/20 hover:border-[#9cd768]/30'}`}
            style={{
                left: note.bbox.x1*scale, top: note.bbox.y1*scale, height: (note.bbox.y2 - note.bbox.y1)*scale,
                width: (note.bbox.x2 - note.bbox.x1)*scale
            }}
            key={note.id}
            onClick={() => onSelectedNote(note, measure)}
            ></div>
    
    )

    return (    
    <div className="relative flex-1 overflow-auto bg-[#041706] min-h-0">
        <div className="relative inline-block">
            {
            <img className="max-w-full h-auto block" src={`${API_URL}${result['img_url']}`} ref={imgRef}/>}
            {measure_bbox}
            {note_bbox}
        </div>
    </div>
)
}

export default ScoreViewer