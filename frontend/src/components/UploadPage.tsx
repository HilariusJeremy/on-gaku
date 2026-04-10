import type {AnnotationData} from '../App'

const UploadPage = ({onResult}: {onResult: (data: AnnotationData) => void}) => {
    const handleSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formData = new FormData();
        if (!e.target.files) return
        const file = e.target.files[0]
        if (!file) return
        formData.append('file', file)
        fetch('/annotate', {method: 'POST', body: formData})
            .then(res => res.json())
            .then(
                data => {
                    onResult(data)
                    console.log(data)
                }
                
                    );
        
    }
    return (
    <div>
        <h1>Upload Page</h1>
        <input type="file" accept="image/png, image/jpeg" onChange={handleSubmit}/> 
    </div>)

}

export default UploadPage