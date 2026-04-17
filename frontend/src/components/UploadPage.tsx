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
    
    const handleCancel = () => {
        controllerRef.current?.abort()
        setLoading(false)
    }

     return (
        <div className="min-h-screen bg-[#041706] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{backgroundImage: "url('/harpsichord.png')"}}/>
            
            <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
                <h1 className="text-6xl sm:text-7xl tracking-widest text-[#e6c365] font-serif">音楽</h1>
                <p className="text-[#9cd768] font-[Manrope] tracking-widest text-xs sm:text-sm uppercase">
                    Sheet Music Annotator
                </p>

                {!loading ? (
                    <label className="cursor-pointer mt-4">
                        <div className="border border-[#e6c365]/30 bg-[#0c200d]/80 backdrop-blur-xl 
                            px-8 sm:px-10 py-4 sm:py-5 text-[#e6c365] font-[Manrope] tracking-widest 
                            text-xs sm:text-sm uppercase hover:bg-[#253a25]/80 transition-all duration-300">
                            Upload Sheet Music
                        </div>
                        <input type="file" accept="image/png, image/jpeg, application/pdf"
                            onChange={handleSubmit} className="hidden"/>
                    </label>
                ) : (
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <LoadingSpinner/>
                        <button onClick={handleCancel}
                            className="text-[#e6c365] font-[Manrope] text-xs tracking-widest 
                            uppercase hover:text-[#e6c365] transition-colors cursor-pointer">
                            Cancel
                        </button>
                    </div>
                )}

                <p className="text-[#9cd768] font-[Manrope] text-xs tracking-widest">
                    PNG · JPEG · PDF
                </p>
                <p className="text-[#9cd768] font-[Manrope] text-xs tracking-widest text-center py-2">
                    © 2026 Hilarius Jeremy I. L.
                </p>
            </div>
        </div>
    )
}
export default UploadPage