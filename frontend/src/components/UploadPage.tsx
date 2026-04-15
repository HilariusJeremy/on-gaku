import { useRef, useState } from 'react';
import type {AnnotationData} from '../App'
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
const UploadPage = ({onResult}: {onResult: (data: AnnotationData) => void}) => {
    const [loading, setLoading] = useState(false)
    const controllerRef = useRef<AbortController | null>(null)
    
    const handleSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formData = new FormData();
        if (!e.target.files) return
        const file = e.target.files[0]
        if (!file) return
        setLoading(true)
        formData.append('file', file)
        controllerRef.current = new AbortController()
        fetch('/annotate', {method: 'POST', body: formData, signal: controllerRef.current?.signal})
            .then(res => res.json())
            .then(
                data => {
                    onResult(data[0])
                    setLoading(false)
                }
                
                    );
        
    }
    return (
    <div>
        <h1>Upload Page</h1>
        <input type="file" accept="image/png, image/jpeg, application/pdf" onChange={handleSubmit}/> 
        {loading ? 
            <div>
                <LoadingSpinner/>
            </div>: <div/>}
    </div>)

}

export default UploadPage