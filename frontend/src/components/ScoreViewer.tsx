import { useEffect, useState } from 'react';
import { useRef } from 'react';
import type { AnnotationData, Measure } from '../App';
import './ScoreViewer.css';


const ScoreViewer = ({result, onSelectedMeasure}: {result: AnnotationData|null, onSelectedMeasure: (measure: Measure) => void}) => {
    const [scale, setScale] = useState(1)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
    if (!imgRef.current) return
    if (imgRef.current.complete) {
        handleLoad()
    }
}, [])

    if (!result) return null


    const measures = result['measures']
    const measure_bbox = measures.map(measure => <div 
            className='bbox'
            style={{
                left: measure.bbox.x1*scale, top: measure.bbox.y1*scale, height: (measure.bbox.y2 - measure.bbox.y1)*scale,
                width: (measure.bbox.x2 - measure.bbox.x1)*scale
            }}
            key={measure.number}
            onClick={() => onSelectedMeasure(measure)}
            ></div>)

    const handleLoad = () => {
        if (!imgRef.current) return
        setScale(imgRef.current.getBoundingClientRect().width / imgRef.current.naturalWidth)
    }

    return (
        <div>
            <h1>ScoreViewer</h1>
            <div className='score-viewer'>
                <img className='sheet-img' onLoad={handleLoad} src={result['img_url']} ref={imgRef}/>
                {measure_bbox}
            </div>
        </div>
    )
}

export default ScoreViewer