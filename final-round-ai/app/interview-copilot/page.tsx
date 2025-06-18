"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Mic, MicOff, Video, VideoOff, Settings, Lightbulb, MessageSquare, Clock, CheckCircle } from "lucide-react"
import { captureTabAudio } from "@/lib/audioCapture"

export default function InterviewCopilotPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [transcription, setTranscription] = useState([
    { speaker: "Interviewer", text: "Tell me about yourself and your background.", time: "00:01" },
    { speaker: "You", text: "I'm a software engineer with 5 years of experience...", time: "00:15" },
  ])
  const audioRef = useRef<{ stop: () => void } | null>(null)

  const startRecording = async () => {
    try {
      audioRef.current = await captureTabAudio({
        onTranscription: (text) => {
          setTranscription(prev => [...prev, {
            speaker: "You",
            text: text,
            time: new Date().toLocaleTimeString()
          }])
        },
        onError: (error) => {
          console.error('录音错误:', error)
          setIsRecording(false)
        }
      })
      setIsRecording(true)
    } catch (error) {
      console.error('启动录音失败:', error)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    audioRef.current?.stop()
    audioRef.current = null
    setIsRecording(false)
  }

  useEffect(() => {
    return () => {
      audioRef.current?.stop()
    }
  }, [])

  const suggestions = [
    "Mention your specific achievements with metrics",
    "Connect your experience to the job requirements",
    "Show enthusiasm for the company's mission",
  ]

  const insights = [
    { label: "Speaking Pace", value: "Good", status: "positive" },
    { label: "Eye Contact", value: "Maintain", status: "warning" },
    { label: "Confidence Level", value: "High", status: "positive" },
    { label: "Answer Length", value: "Optimal", status: "positive" },
  ]

  const connectWebSocket = () => {
    const token = 'your-auth-token'; // 从你的认证系统获取
    const ws = new WebSocket('ws://localhost/ws');
  
    ws.onopen = () => {
      // 发送认证信息
      ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
  
    return ws;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="interview-copilot" />

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <MessageSquare className="h-4 w-4 mr-1" />
              Live Interview Assistant
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Copilot</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get real-time coaching and feedback during your live interviews. Our AI analyzes your responses and
              provides instant suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Video and Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Feed */}
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Your Video Feed</p>
                        <p className="text-sm opacity-75">Camera is {isVideoOn ? "on" : "off"}</p>
                      </div>
                    </div>

                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">Recording</span>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                      <Button
                        variant={isRecording ? "destructive" : "default"}
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                        className="rounded-full"
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant={isVideoOn ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className="rounded-full"
                      >
                        {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Transcription */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Live Transcription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {transcription.map((entry, index) => (
                      <div key={index} className="flex space-x-3">
                        <Badge variant={entry.speaker === "You" ? "default" : "secondary"} className="text-xs">
                          {entry.speaker}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{entry.text}</p>
                          <span className="text-xs text-gray-500">{entry.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - AI Insights */}
            <div className="space-y-6">
              {/* Real-time Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{insight.label}</span>
                        <Badge
                          variant={
                            insight.status === "positive"
                              ? "default"
                              : insight.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {insight.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Timer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Session Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">15:42</div>
                    <p className="text-sm text-gray-600">Interview Duration</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Save Session Notes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export Transcript
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Schedule Follow-up
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
