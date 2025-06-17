import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"
import { Target, Brain, MessageSquare, Trophy, Star, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const brandLogos = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"]

  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Practice",
      description: "Get personalized interview questions based on your target role and company",
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "Real-Time Feedback",
      description: "Receive instant analysis of your responses and improvement suggestions",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      title: "Live Coaching",
      description: "Get real-time hints and guidance during your actual interviews",
    },
    {
      icon: <Trophy className="h-8 w-8 text-orange-600" />,
      title: "Track Progress",
      description: "Monitor your improvement and readiness with detailed analytics",
    },
  ]

  const stats = [
    { number: "250K+", label: "Job Offers" },
    { number: "1.2M+", label: "Interviews" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Companies" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Star className="h-4 w-4 mr-1" />
              Trusted by 250K+ job seekers
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Land Your Next Job in <span className="text-blue-600">30 Days*</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Master your interviews with AI-powered coaching, real-time feedback, and personalized practice sessions.
              Join thousands who've landed their dream jobs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Watch Demo
              </Button>
            </div>

            {/* Brand Logos */}
            <div className="mb-16">
              <p className="text-sm text-gray-500 mb-6">Trusted by candidates at</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
                {brandLogos.map((brand) => (
                  <div key={brand} className="text-center">
                    <div className="h-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">{brand}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Funnel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Final Round AI Works</h2>
            <p className="text-lg text-gray-600">Four simple steps to interview success</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600">Hear from candidates who landed their dream jobs</p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-xl text-gray-300 mb-8">Join 250K+ successful candidates and start your journey today</p>
          <Button size="lg" className="text-lg px-8 py-3">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-400 mt-4">*Based on average time to job offer for active users</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
