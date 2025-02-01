import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Toaster } from './components/ui/toaster'
import { useToast } from './components/ui/use-toast'
import { FeedbackResult } from './types/feedback'

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.includes('audio/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an audio file (.wav, .mp3, etc.)',
        variant: 'destructive',
        duration: 10000,
      })
      return
    }

    setAudioFile(file)
    setFeedback(null)
    await analyzeFeedback(file)
  }

  const analyzeFeedback = async (file: File) => {
    try {
      setIsAnalyzing(true)
      const formData = new FormData()
      formData.append('audio', file)

      console.log('Sending request to:', `${import.meta.env.VITE_API_URL}/api/analyze`)
      console.log('File being sent:', file.name, file.type)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', response.status, errorText)
        throw new Error(`Failed to analyze audio: ${response.status} ${errorText}`)
      }

      const data: FeedbackResult = await response.json()
      setFeedback(data)
    } catch (error) {
      console.error('Error analyzing audio:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze the recording. Please try again.',
        variant: 'destructive',
        duration: 10000,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-500 dark:text-green-400';
    if (score >= 6) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED]">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <Card className="bg-[#111111] border-[#222222]">
              <CardHeader>
                <CardTitle className="text-[#EDEDED]">Cold Call Coach</CardTitle>
                <CardDescription className="text-[#AAAAAA]">
                  Upload your cold call recording from Nooks and get a scorecard and actionable feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <label
                      htmlFor="audio-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#111111] hover:bg-[#222222] border-[#333333]"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isAnalyzing ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-sm text-[#AAAAAA]">Analyzing your call...</p>
                          </div>
                        ) : (
                          <>
                            <p className="mb-2 text-sm text-[#AAAAAA]">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[#AAAAAA]">Audio files (WAV, MP3, etc.)</p>
                          </>
                        )}
                      </div>
                      <input
                        id="audio-upload"
                        type="file"
                        className="hidden"
                        accept="audio/*"
                        onChange={handleFileChange}
                        disabled={isAnalyzing}
                      />
                    </label>
                  </div>
                  {audioFile && !isAnalyzing && (
                    <div className="text-sm text-[#AAAAAA]">
                      Analyzing: {audioFile.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Section */}
          <div className="space-y-6">
            {feedback && (
              <>
                {/* Overall Score & Summary */}
                <Card className="bg-[#111111] border-[#222222] overflow-hidden">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <CardContent className="pt-6">
                      <div className="flex items-baseline gap-2 mb-4">
                        <h3 className="text-2xl font-bold text-[#EDEDED]">Overall Score:</h3>
                        <span className={`text-3xl font-bold ${getScoreColor(feedback.overallScore.score)}`}>
                          {feedback.overallScore.score}/10
                        </span>
                      </div>
                      <p className="text-[#EDEDED]">{feedback.overallScore.summary}</p>
                    </CardContent>
                  </div>
                </Card>

                {/* Detailed Sections */}
                {[
                  {
                    title: 'Opener Analysis',
                    data: feedback.openerAnalysis,
                    suggestion: feedback.openerAnalysis.alternativeOpener,
                    suggestionTitle: 'Suggested Alternative'
                  },
                  {
                    title: 'Problem Proposition',
                    data: feedback.problemProposition,
                    suggestion: feedback.problemProposition.alternativeProposition,
                    suggestionTitle: 'Suggested Alternative'
                  },
                  {
                    title: 'Objection Handling',
                    data: feedback.objectionHandling,
                    suggestion: feedback.objectionHandling.alternativeFramework,
                    suggestionTitle: 'Suggested Framework'
                  },
                  {
                    title: 'Engagement & Flow',
                    data: feedback.engagementAndFlow,
                    recommendations: feedback.engagementAndFlow.recommendations
                  },
                  {
                    title: 'Closing & Next Steps',
                    data: feedback.closingAndNextSteps,
                    suggestion: feedback.closingAndNextSteps.alternativeClosing,
                    suggestionTitle: 'Suggested Closing'
                  }
                ].map((section, index) => (
                  <Card key={index} className="bg-[#111111] border-[#222222]">
                    <CardContent className="pt-6">
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className="text-xl font-bold text-[#EDEDED]">{section.title}</h3>
                        <span className={`text-lg font-semibold ${getScoreColor(section.data.score)}`}>
                          Score: {section.data.score}/10
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-2 mb-4">
                        {section.data.feedback.map((point, i) => (
                          <li key={i} className="text-[#EDEDED]">{point}</li>
                        ))}
                      </ul>
                      {section.suggestion && (
                        <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg">
                          <p className="font-semibold text-green-400 mb-2">{section.suggestionTitle}:</p>
                          <p className="text-[#EDEDED] italic">{section.suggestion}</p>
                        </div>
                      )}
                      {section.recommendations && section.recommendations.length > 0 && (
                        <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg">
                          <p className="font-semibold text-blue-400 mb-2">Recommendations:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            {section.recommendations.map((rec, i) => (
                              <li key={i} className="text-[#EDEDED] italic">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Actionable Takeaways */}
                <Card className="bg-[#111111] border-[#222222]">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold mb-4 text-[#EDEDED]">Actionable Takeaways</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-[#EDEDED] mb-2">Top Areas for Improvement:</h4>
                          <ul className="list-disc pl-5 space-y-2">
                            {feedback.actionableTakeaways.improvements.map((improvement, i) => (
                              <li key={i} className="text-[#EDEDED]">{improvement}</li>
                            ))}
                          </ul>
                        </div>
                        {feedback.actionableTakeaways.scriptExample && (
                          <div className="p-4 bg-[#1a1a1a] rounded-lg">
                            <h4 className="font-semibold text-purple-400 mb-2">Example Script:</h4>
                            <p className="text-[#EDEDED] italic">{feedback.actionableTakeaways.scriptExample}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default App
