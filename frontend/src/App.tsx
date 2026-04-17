import { useState } from 'react'
//import './App.css'
import ScoreViewer from './components/ScoreViewer'
import Sidebar from './components/Sidebar'
import UploadPage from './components/UploadPage'

export interface Key {
    fifths: number,
    accidentals: string[],
    display: string
}

export interface Note { 
  pitch: string, 
  bbox: Bbox, 
  id: number, 
  track: number 
}

export interface Measure { 
  number: number, 
  notes: Note[], 
  bbox: Bbox 
}

export interface Bbox {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export interface AnnotationData {
        key: Key,
        measures: Measure[],
        img_url: string
}



function App() {
  const [result, setResult] =  useState<AnnotationData | null>(null)
  const [selectedMeasure, setSelectedMeasure] = useState<Measure | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const handleSelectMeasure = (measure: Measure) => {
    if (selectedMeasure?.number===measure.number){
      setSelectedMeasure(null)
      setSelectedNote(null)
    } else {
      setSelectedMeasure(measure)
      setSelectedNote(null)
    }
  }

  const handleSelectNote = (note: Note | null, measure: Measure) => {
    setSelectedMeasure(measure)
    if (selectedNote?.id === note?.id) {
        setSelectedNote(null)  // toggle off
        setSelectedMeasure(null)
    } else {
        setSelectedNote(note)
        setSelectedMeasure(measure)
    }
}

  const handleExport = async () => {
    const url = "http://localhost:8000/export";
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
     }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'annotated.png';
      a.click();
URL.revokeObjectURL(blobUrl);

    } catch (error) {
    console.error((error as Error).message);
  }
  }

  return (
    result ? 
    (
    <div className="min-h-screen bg-[#041706] flex flex-col">
    <div className="flex justify-between items-center px-8 py-4 bg-[#0c200d] border-b border-[#e6c365]/10">
        <h1 className="text-2xl text-[#e6c365] font-serif tracking-widest">音楽</h1>
        <div className="flex gap-4">
            <button onClick={() => setResult(null)}
                className="cursor-pointer text-[#e6c365]/60 font-[Manrope] text-xs tracking-widest uppercase 
                hover:text-[#e6c365] transition-colors border border-[#e6c365]/20 px-4 py-2">
                New Upload
            </button>
            <button onClick={handleExport}
                className="cursor-pointer bg-gradient-to-r from-[#e6c365] to-[#ac8d35] text-[#041706] 
                font-[Manrope] text-xs tracking-widest uppercase px-4 py-2">
                Export
            </button>
        </div>
    </div>
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <ScoreViewer result={result} onSelectedMeasure={handleSelectMeasure} onSelectedNote={handleSelectNote}
          selectedMeasure={selectedMeasure} selectedNote={selectedNote}/>
        <Sidebar selectedMeasure={selectedMeasure} selectedNote={selectedNote} onSelectedNote={handleSelectNote}/>
      </div>
      <p className="text-[#9cd768] font-[Manrope] text-xs tracking-widest text-center py-4 mt-auto">
    © 2026 Hilarius Jeremy I. L.
</p>
    </div>) :  
    <div>
      <UploadPage onResult={setResult}/>
    </div>
  )
}

export default App
