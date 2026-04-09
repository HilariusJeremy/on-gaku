interface Key {
    fifths: number,
    accidentals: string[],
    display: string
}

interface Measure {
    number: number, 
    treble: string[],
    bass: string[],
    bbox: Bbox
}

interface Bbox {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

interface AnnotationData {
        key: Key,
        measures: Measure[],
        img_url: string
}


const UploadPage = ({onResult}) => {
    const handleSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formData = new FormData();
        if (!e.target.files) return
        const file = e.target.files[0]
        if (!file) return
        formData.append('file', file)
        fetch('/annotate', {method: 'POST', body: formData})
            .then(res => res.json())
            .then(data => onResult(data));
        
    }
    return (
    <div>
        <h1>Upload Page</h1>
        <input type="file" accept="image/png, image/jpeg" onChange={handleSubmit}/> 
    </div>)

}

export default UploadPage