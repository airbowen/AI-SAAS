"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    avatar: "/placeholder.svg?height=40&width=40",
    quote:
      "Final Round AI helped me land my dream job at Google. The real-time feedback during practice sessions was incredible!",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager",
    company: "Microsoft",
    avatar: "/placeholder.svg?height=40&width=40",
    quote: "The mock interviews were so realistic. I felt completely prepared for my actual interviews. Got 3 offers!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist",
    company: "Amazon",
    avatar: "/placeholder.svg?height=40&width=40",
    quote: "The AI coaching during live interviews gave me the confidence boost I needed. Highly recommend!",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "UX Designer",
    company: "Meta",
    avatar: "/placeholder.svg?height=40&width=40",
    quote:
      "Went from nervous wreck to confident candidate in just 2 weeks. The personalized feedback was game-changing.",
    rating: 5,
  },
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative max-w-4xl mx-auto">
      <Card className="min-h-[200px]">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-lg text-gray-700 mb-6 italic">"{testimonials[currentIndex].quote}"</blockquote>
            <div className="flex items-center justify-center space-x-4">
              <Avatar>
                <AvatarImage src={testimonials[currentIndex].avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {testimonials[currentIndex].name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{testimonials[currentIndex].name}</p>
                <p className="text-sm text-gray-600">{testimonials[currentIndex].role}</p>
                <Badge variant="secondary" className="mt-1">
                  {testimonials[currentIndex].company}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="sm"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full"
        onClick={prevTestimonial}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full"
        onClick={nextTestimonial}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
