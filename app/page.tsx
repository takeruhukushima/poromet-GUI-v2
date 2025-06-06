"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, BarChart3, Settings, ImageIcon, Server, AlertCircle } from "lucide-react"
// Chart components removed as we'll use the image directly

interface AnalysisParams {
  magnification: number
  max_diam_nm: number
  thresh_mag: number
}

interface AnalysisResult {
  avg_diam_nm: number
  mode_diam_nm: number
  histogram_data: Array<{ diameter: number; pdf: number }>
  output_dir: string
  pixel_size: number
}

const API_BASE_URL = "http://127.0.0.1:8000"

export default function PorometApp() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [params, setParams] = useState<AnalysisParams>({
    magnification: 300,
    max_diam_nm: 80,
    thresh_mag: 1.8,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: "GET",
        mode: "cors",
      })
      if (response.ok) {
        setApiStatus("online")
      } else {
        setApiStatus("offline")
      }
    } catch {
      setApiStatus("offline")
    }
  }

  useEffect(() => {
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setError(null)
    }
  }

  const handleParamChange = (key: keyof AnalysisParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const runAnalysis = async () => {
    if (!selectedFile) {
      setError("Please select an image file first")
      return
    }

    if (apiStatus !== "online") {
      setError("Backend API is not running. Please start the server first.")
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setError(null)

    try {
      console.log("Starting analysis...")

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("magnification", params.magnification.toString())
      formData.append("max_diam_nm", params.max_diam_nm.toString())
      formData.append("thresh_mag", params.thresh_mag.toString())

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 1000)

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        body: formData,
        mode: "cors",
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Analysis failed: ${response.statusText}`

        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.detail || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const analysisResult = await response.json()
      setResult(analysisResult)
      console.log("Analysis completed successfully")
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const downloadResults = async () => {
    if (!result) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/download/${result.output_dir}`, {
        mode: "cors",
      })
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `poromet_results_${result.output_dir}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Failed to download results")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Poromet</h1>
          <p className="text-lg text-gray-600">Pore Size Analysis Tool</p>
        </div>

        {/* API Status Banner */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              apiStatus === "online"
                ? "bg-green-100 text-green-800"
                : apiStatus === "offline"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <Server className="h-4 w-4" />
            API Status: {apiStatus === "online" ? "Ready" : apiStatus === "offline" ? "Offline" : "Checking..."}
          </div>

          {apiStatus === "offline" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-semibold text-red-800">Backend Server Not Running</h3>
                  <p className="text-sm text-red-700 mt-1">
                    To start the backend server, run this command in your terminal:
                  </p>
                  <code className="block bg-red-100 text-red-800 px-3 py-2 rounded mt-2 text-sm">
                    python backend/server.py
                  </code>
                  <p className="text-xs text-red-600 mt-2">The server will start at: http://127.0.0.1:8000</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image Upload
                </CardTitle>
                <CardDescription>Select your SEM image for pore size analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : "Click to upload image"}
                      </p>
                    </label>
                  </div>
                  {selectedFile && <div className="text-sm text-green-600">✓ File selected: {selectedFile.name}</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Analysis Parameters
                </CardTitle>
                <CardDescription>Configure the analysis settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="magnification">SEM Magnification</Label>
                    <Input
                      id="magnification"
                      type="number"
                      value={params.magnification}
                      onChange={(e) => handleParamChange("magnification", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_diam">Max Diameter (nm)</Label>
                    <Input
                      id="max_diam"
                      type="number"
                      value={params.max_diam_nm}
                      onChange={(e) => handleParamChange("max_diam_nm", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thresh_mag">Threshold Magnification</Label>
                    <Input
                      id="thresh_mag"
                      type="number"
                      step="0.01"
                      value={params.thresh_mag}
                      onChange={(e) => handleParamChange("thresh_mag", Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={runAnalysis}
              disabled={!selectedFile || isAnalyzing || apiStatus !== "online"}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? "Analyzing..." : "Run Analysis"}
            </Button>

            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-gray-600">Processing image... {progress}%</p>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>Pore size distribution analysis complete</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-900">Average Diameter</h3>
                          <p className="text-2xl font-bold text-blue-700">{result.avg_diam_nm.toFixed(2)} nm</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-900">Mode Diameter</h3>
                          <p className="text-2xl font-bold text-green-700">{result.mode_diam_nm.toFixed(2)} nm</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900">Pixel Size</h3>
                        <p className="text-lg text-gray-700">{result.pixel_size.toFixed(4)} nm/px</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="distribution" className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500 mb-2">Pore Size Distribution</div>
                        <div className="relative w-full aspect-[4/3] bg-gray-50 rounded overflow-hidden">
                          <img 
                            src={`${API_BASE_URL}/api/histogram/${result.output_dir}?t=${Date.now()}`} 
                            alt="Pore size distribution"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error("Failed to load histogram image. Output dir:", result.output_dir);
                              console.error("Full URL:", `${API_BASE_URL}/api/histogram/${result.output_dir}`);
                              
                              // Try to fetch the image directly to see the response
                              fetch(`${API_BASE_URL}/api/histogram/${result.output_dir}`, {
                                method: 'GET',
                                mode: 'cors',
                                credentials: 'same-origin'
                              })
                              .then(response => {
                                console.log("Histogram fetch response status:", response.status);
                                return response.text().then(text => {
                                  console.log("Histogram response text:", text);
                                  return text;
                                });
                              })
                              .catch(error => {
                                console.error("Error fetching histogram:", error);
                              });
                              
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width=\'800\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'sans-serif\' font-size=\'14\' text-anchor=\'middle\' dominant-baseline=\'middle\' fill=\'%239ca3af\'%3EHistogram not available%3C/text%3E%3C/svg%3E';
                            }}
                            onLoad={() => console.log("Histogram image loaded successfully")}
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Data points: {result.histogram_data.length}</p>
                        <p>
                          Range: {Math.min(...result.histogram_data.map((d) => d.diameter)).toFixed(1)} -{" "}
                          {Math.max(...result.histogram_data.map((d) => d.diameter)).toFixed(1)} nm
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button onClick={downloadResults} className="w-full mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Results
                  </Button>
                </CardContent>
              </Card>
            )}

            {!result && !error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Upload an image and run analysis to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
