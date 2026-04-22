import { useRef, useState } from 'react';
import type {AnnotationData} from '../App'
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
import { API_URL } from '../api'

const UploadPage = ({onResult}: {onResult: (data: AnnotationData) => void}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const controllerRef = useRef<AbortController | null>(null)
    
    const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const formData = new FormData();
        if (!e.target.files) return
        const file = e.target.files[0]
        if (!file) return

        setLoading(true)
        setError(null)
        formData.append('file', file)
        controllerRef.current = new AbortController()

        try{
            const res = await fetch(`${API_URL}/annotate`, {
                method: 'POST', 
                body: formData, 
                signal: controllerRef.current?.signal
            })

            if (!res.ok) {
                const data = await res.json()
                switch (res.status) {
                    case 413:
                        throw new Error('File too large. Maximum size is 5MB.')
                    case 503:
                        throw new Error('Server is busy. Please try again in a few minutes.')
                    case 429:
                        throw new Error('Too many requests. Please wait before trying again.')
                    case 422:
                        throw new Error('Could not process image. Try a cleaner PNG scan.')
                    default:
                        throw new Error(data.detail || 'Something went wrong.')
                }
            }
            const data = await res.json()
            if (!data[0]) throw new Error('Invalid response. Please try again.')
            onResult(data[0])

        } catch (err) {
            if ((err as Error).name === 'AbortError') return
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
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
                        <p className="text-[#e6c365]/60 font-[Manrope] text-xs tracking-widest uppercase">
                            Processing... this may take a few minutes
                        </p>
                        <button onClick={handleCancel}
                            className="text-[#e6c365] font-[Manrope] text-xs tracking-widest 
                            uppercase hover:text-[#e6c365] transition-colors cursor-pointer">
                            Cancel
                        </button>
                    </div>
                )}

                {error && (
                    <p className="text-red-400 font-[Manrope] text-xs tracking-widest text-center max-w-xs">
                        {error}
                    </p>
                )}

                <p className="text-[#9cd768] font-[Manrope] text-xs tracking-widest">
                    PNG · JPEG · PDF · Max 5MB
                </p>
                <p className="text-[#e6c365] font-[Manrope] text-xs tracking-widest text-center">
                    Please only upload sheet music you own or that is in the public domain.
                </p>

                <p className="text-[#9cd768] font-[Manrope] text-xs tracking-widest text-center py-2">
                    © 2026 Hilarius Jeremy I. L.
                </p>
            </div>
        </div>
    )
}

export default UploadPage