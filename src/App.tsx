import React, { useState, useRef } from 'react'
import { saveAs } from 'file-saver'
import { Upload, Download, Image as ImageIcon } from 'lucide-react'
import { removeBackground } from '@imgly/background-removal'

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setError(null)
      }
      reader.onerror = () => {
        setError('Failed to read the image file. Please try again.')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProcessImage = async () => {
    if (!image) return

    setIsProcessing(true)
    setError(null)

    try {
      const blob = await fetch(image).then(res => res.blob())
      const result = await removeBackground(blob, {
        progress: (progress) => {
          console.log(`Progress: ${progress}`)
        }
      })
      setProcessedImage(URL.createObjectURL(result))
    } catch (error) {
      console.error('Error processing image:', error)
      setError('Failed to process the image. Please try a different image or try again later.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (processedImage) {
      try {
        saveAs(processedImage, 'processed_image.png')
      } catch (error) {
        console.error('Error downloading image:', error)
        setError('Failed to download the image. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Advanced Background Removal</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <Upload className="mr-2" size={20} />
            Upload Image
          </button>
        </div>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {image && (
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Original Image</h2>
              <img src={image} alt="Original" className="w-full h-auto rounded" />
            </div>
          )}
          {processedImage && (
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Processed Image</h2>
              <img src={processedImage} alt="Processed" className="w-full h-auto rounded" />
              <button
                onClick={handleDownload}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
              >
                <Download className="mr-2" size={20} />
                Download Processed Image
              </button>
            </div>
          )}
        </div>
        {image && !processedImage && (
          <div className="mt-6">
            <button
              onClick={handleProcessImage}
              disabled={isProcessing}
              className={`bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors flex items-center mx-auto ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ImageIcon className="mr-2" size={20} />
              {isProcessing ? 'Processing...' : 'Remove Background'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App