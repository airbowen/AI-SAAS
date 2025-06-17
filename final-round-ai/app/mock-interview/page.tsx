"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Play, Pause, RotateCcw, Target, Clock, Star, TrendingUp, BookOpen, Users } from "lucide-react"

export default function MockInterviewPage() {
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")

  const questions = [
    "Tell me about yourself and your background.",
    "Why are you interested in this position?",
    "What's your greatest strength?",
    "Describe a challenging project you worked on.",
    "Where do you see yourself in 5 years?",
  ]

  const interviewTypes = [
    {
      title: "Technical Interview",
      description: "Coding challenges and system design",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "Behavioral Interview",
      description: "Situational and experience-based questions",
      icon: <Users className="h-6 w-6" />,
    },
    { title: "Case Study", description: "Business problem-solving scenarios", icon: <Target className="h-6 w-6" /> },
    {
      title: "Leadership Interview",
      description: "Management and leadership scenarios",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ]

  const recentSessions = [
    { company: "Google", role: "Software Engineer", score: 85, date: "2 days ago" },
    { company: "Microsoft", role: "Product Manager", score: 92, date: "1 week ago" },
    { company: "Amazon", role: "Data Scientist", score: 78, date: "2 weeks ago" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="mock-interview" />

      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <Target className="h-4 w-4 mr-1" />
              AI-Powered Practice
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mock Interview</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Practice with realistic interview scenarios tailored to your target role and company. Get detailed
              feedback and improve your performance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Interview Setup and Practice */}
            <div className="lg:col-span-2 space-y-6">
              {!isInterviewActive ? (
                <>
                  {/* Interview Setup */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Start New Mock Interview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Target Role</label>
                          <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="software-engineer">Software Engineer</SelectItem>
                              <SelectItem value="product-manager">Product Manager</SelectItem>
                              <SelectItem value="data-scientist">Data Scientist</SelectItem>
                              <SelectItem value="designer">UX Designer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Target Company</label>
                          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="google">Google</SelectItem>
                              <SelectItem value="microsoft">Microsoft</SelectItem>
                              <SelectItem value="amazon">Amazon</SelectItem>
                              <SelectItem value="meta">Meta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => setIsInterviewActive(true)}
                        disabled={!selectedRole || !selectedCompany}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Mock Interview
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Interview Types */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {interviewTypes.map((type, index) => (
                          <div
                            key={index}
                            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="text-blue-600">{type.icon}</div>
                              <div>
                                <h3 className="font-semibold mb-1">{type.title}</h3>
                                <p className="text-sm text-gray-600">{type.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                /* Active Interview Interface */
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Mock Interview in Progress</CardTitle>
                      <Badge variant="secondary">
                        Question {currentQuestion + 1} of {questions.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Question Display */}
                    <div className="p-6 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Current Question:</h3>
                      <p className="text-gray-800">{questions[currentQuestion]}</p>
                    </div>

                    {/* Recording Area */}
                    <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <div className="w-6 h-6 bg-white rounded-full"></div>
                          </div>
                          <p className="text-lg">Recording Your Response</p>
                          <p className="text-sm opacity-75">Take your time to answer</p>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={() => setIsInterviewActive(false)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Interview
                      </Button>
                      <Button
                        onClick={() => setCurrentQuestion(Math.min(currentQuestion + 1, questions.length - 1))}
                        disabled={currentQuestion >= questions.length - 1}
                      >
                        Next Question
                      </Button>
                      <Button variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry Question
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Progress and History */}
            <div className="space-y-6">
              {/* Progress Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Interviews Completed</span>
                      <Badge variant="default">23</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Score</span>
                      <Badge variant="default">85%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Improvement Rate</span>
                      <Badge variant="default">+12%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.map((session, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">{session.company}</p>
                            <p className="text-xs text-gray-600">{session.role}</p>
                          </div>
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            {session.score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{session.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Interview Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">Pro Tip:</p>
                      <p className="text-green-700">Use the STAR method for behavioral questions</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">Remember:</p>
                      <p className="text-blue-700">Practice makes perfect - aim for 3 sessions per week</p>
                    </div>
                  </div>
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
