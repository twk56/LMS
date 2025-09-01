import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  Bell, 
  Palette, 
  Zap, 
  Shield, 
  Globe, 
  Sparkles,
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  Brain,
  Target,
  Rocket,
  MousePointer,
  Code,
  Lightbulb,
  Heart,
  Coffee,
  Layers,
  Camera,
  Headphones,
  Smartphone
} from 'lucide-react';

interface WelcomeProps {
  canLogin: boolean;
  canRegister: boolean;
  laravelVersion: string;
  phpVersion: string;
  auth: {
    user: any;
  };
}

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion, auth }: WelcomeProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll tracking for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      quote: "ระบบที่ยอดเยี่ยม ใช้งานง่าย และมี UI ที่สวยงามมาก",
      author: "อาจารย์สมชาย วิทยากร",
      role: "อาจารย์มหาวิทยาลัย",
      avatar: "👨‍🏫"
    },
    {
      quote: "เรียนรู้ได้ทุกที่ทุกเวลา ระบบรองรับได้ดีมาก",
      author: "น.ส.มานี นักเรียน",
      role: "นักศึกษา",
      avatar: "👩‍🎓"
    },
    {
      quote: "การจัดการหลักสูตรง่ายดาย และมีฟีเจอร์ครบครัน",
      author: "คุณสมศักดิ์ ผู้จัดการ",
      role: "ผู้บริหาร",
      avatar: "👨‍💼"
    }
  ];

  return (
    <>
      <Head title="ยินดีต้อนรับ - Learning Management System" />
      
      {/* Creative Hero Section with Interactive Elements */}
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Dynamic Background Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
          }}></div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-${4 + (i % 3) * 2} h-${4 + (i % 3) * 2} opacity-10`}
                style={{
                  left: `${10 + (i * 8) % 80}%`,
                  top: `${10 + (i * 13) % 80}%`,
                  transform: `translateY(${scrollY * (0.1 + i * 0.05)}px) rotate(${i * 30}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <div className={`w-full h-full ${
                  i % 4 === 0 ? 'bg-purple-500 rounded-full' :
                  i % 4 === 1 ? 'bg-blue-500 rotate-45' :
                  i % 4 === 2 ? 'bg-pink-500 rounded-lg' :
                  'bg-yellow-500 clip-path-triangle'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          {/* Creative Navigation */}
          <nav className="flex items-center justify-between p-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Layers className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl opacity-30 blur group-hover:opacity-60 transition-opacity duration-300"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">LMS</span>
                <span className="block text-sm text-gray-300">Creative Learning</span>
              </div>
            </div>
            
            {!auth.user && (
              <div className="flex items-center space-x-4">
                {canLogin && (
                  <Button variant="ghost" asChild className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300">
                    <a href="/login" className="flex items-center space-x-2">
                      <span>เข้าสู่ระบบ</span>
                    </a>
                  </Button>
                )}
                {canRegister && (
                  <Button asChild className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group">
                    <a href="/register" className="flex items-center space-x-2 relative z-10">
                      <Rocket className="h-4 w-4" />
                      <span>เริ่มต้นเลย</span>
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                    </a>
                  </Button>
                )}
              </div>
            )}
          </nav>

          {/* Creative Hero Content */}
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-6xl mx-auto">
              {/* Main Hero */}
              <div className="text-center mb-20">
                <div className="mb-8">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-8">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="text-purple-300 font-medium">Creative Learning Experience</span>
                  </div>
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-tight">
                  <span className="block text-white mb-4">Learn</span>
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                    Create
                  </span>
                  <span className="block text-white">Inspire</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                  ระบบการเรียนรู้ที่ผสมผสานความคิดสร้างสรรค์ เทคโนโลยีล้ำสมัย 
                  และประสบการณ์ที่ไม่เหมือนใคร
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                  {auth.user ? (
                    <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 px-10 py-6 text-lg relative overflow-hidden group">
                      <a href="/dashboard" className="flex items-center space-x-3 relative z-10">
                        <Brain className="h-6 w-6" />
                        <span>เข้าสู่แดชบอร์ด</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                      </a>
                    </Button>
                  ) : (
                    <>
                      {canLogin && (
                        <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 px-10 py-6 text-lg relative overflow-hidden group">
                          <a href="/login" className="flex items-center space-x-3 relative z-10">
                            <Play className="h-6 w-6" />
                            <span>เริ่มเรียนรู้</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                          </a>
                        </Button>
                      )}
                      
                      {canRegister && (
                        <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 px-10 py-6 text-lg group">
                          <a href="/register" className="flex items-center space-x-3">
                            <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            <span>สร้างบัญชี</span>
                          </a>
                        </Button>
                      )}
                    </>
                  )}
                </div>
                
                {/* Creative Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {[
                    { number: "2.5K+", label: "Creative Learners", icon: Heart, color: "from-pink-500 to-rose-500" },
                    { number: "150+", label: "Courses", icon: Lightbulb, color: "from-yellow-500 to-orange-500" },
                    { number: "98%", label: "Satisfaction", icon: Star, color: "from-purple-500 to-indigo-500" },
                    { number: "24/7", label: "Support", icon: Coffee, color: "from-blue-500 to-cyan-500" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center group" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl`}>
                        <stat.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Creative Services Section */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-black py-20 relative overflow-hidden">
        <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Creative
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              เครื่องมือสร้างสรรค์ที่จะเปลี่ยนการเรียนรู้ของคุณให้เป็นประสบการณ์ที่ไม่มีวันลืม
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Interactive Learning",
                description: "การเรียนรู้แบบโต้ตอบที่ทำให้ทุกบทเรียนมีชีวิตชีวา",
                icon: MousePointer,
                color: "from-purple-500 to-pink-500",
                features: ["VR/AR Integration", "Gamification", "Real-time Feedback"]
              },
              {
                title: "Creative Tools",
                description: "เครื่องมือสร้างสรรค์ที่ช่วยให้คุณแสดงออกได้อย่างเต็มที่",
                icon: Palette,
                color: "from-pink-500 to-yellow-500",
                features: ["Design Studio", "Video Editor", "Animation Tools"]
              },
              {
                title: "Smart Analytics",
                description: "การวิเคราะห์อัจฉริยะที่เข้าใจการเรียนรู้ของคุณ",
                icon: Brain,
                color: "from-blue-500 to-purple-500",
                features: ["AI Insights", "Progress Tracking", "Personalized Path"]
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group relative"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 h-full hover:bg-black/70 transition-all duration-300">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-2xl`}>
                    <service.icon className="h-10 w-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                  
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-400">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <Button className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:bg-gradient-to-r hover:from-purple-600/40 hover:to-pink-600/40 transition-all duration-300">
                      เรียนรู้เพิ่มเติม
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              What Our
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Creators Say
              </span>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-8">
              <div className="flex transition-transform duration-500 ease-in-out" style={{transform: `translateX(-${currentTestimonial * 100}%)`}}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 text-center">
                    <div className="text-6xl mb-6">{testimonial.avatar}</div>
                    <blockquote className="text-xl lg:text-2xl text-white mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="text-purple-300 font-semibold">{testimonial.author}</div>
                    <div className="text-gray-400">{testimonial.role}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentTestimonial === index 
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 scale-125' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creative Call to Action */}
      <div className="bg-black py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-yellow-900/30"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%200h100v100H0z%22%20fill%3D%22none%22/%3E%3Cpath%20d%3D%22M50%200L60.6%2039.4%20100%2050%2060.6%2060.6%2050%20100%2039.4%2060.6%200%2050%2039.4%2039.4z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22/%3E%3C/svg%3E')] opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-8">
                <Rocket className="h-5 w-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Ready to Create?</span>
              </div>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Start Your
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Creative Journey
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              เข้าร่วมกับชุมชนนักเรียนและครูผู้สอนที่มีความคิดสร้างสรรค์ 
              และเริ่มสร้างประสบการณ์การเรียนรู้ที่ไม่เหมือนใคร
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              {auth.user ? (
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 px-12 py-6 text-xl relative overflow-hidden group">
                  <a href="/dashboard" className="flex items-center space-x-3 relative z-10">
                    <Brain className="h-6 w-6" />
                    <span>เข้าสู่แดชบอร์ด</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  </a>
                </Button>
              ) : (
                <>
                  {canLogin && (
                    <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 px-12 py-6 text-xl relative overflow-hidden group">
                      <a href="/login" className="flex items-center space-x-3 relative z-10">
                        <Play className="h-6 w-6" />
                        <span>เริ่มเรียนรู้</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                      </a>
                    </Button>
                  )}
                  
                  {canRegister && (
                    <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 px-12 py-6 text-xl group">
                      <a href="/register" className="flex items-center space-x-3">
                        <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span>สร้างบัญชี</span>
                      </a>
                    </Button>
                  )}
                </>
              )}
            </div>
            
            {/* Tech Stack Minimal */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                Laravel {laravelVersion}
              </span>
              <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                PHP {phpVersion}
              </span>
              <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                React 19
              </span>
              <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                TypeScript
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Creative Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-black py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M20%2020c0-11.046-8.954-20-20-20s-20%208.954-20%2020%208.954%2020%2020%2020%2020-8.954%2020-20z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Layers className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl opacity-30 blur"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">LMS</span>
                  <span className="block text-sm text-gray-300">Creative Learning</span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                ระบบจัดการการเรียนรู้ที่ผสมผสานความคิดสร้างสรรค์ 
                เทคโนโลยีล้ำสมัย และประสบการณ์ที่ไม่เหมือนใคร
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {['หลักสูตร', 'เกี่ยวกับเรา', 'ติดต่อเรา', 'ช่วยเหลือ'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center space-x-2 group">
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      <span>{link}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">ติดต่อเรา</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Globe className="h-4 w-4" />
                  <span>www.creativelms.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Headphones className="h-4 w-4" />
                  <span>support@creativelms.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Smartphone className="h-4 w-4" />
                  <span>+66 2 xxx xxxx</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Creative Learning Management System. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Made with <Heart className="inline h-4 w-4 text-red-400 mx-1" /> for creative learners
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
