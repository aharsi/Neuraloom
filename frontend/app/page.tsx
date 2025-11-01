// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-900 font-sans antialiased">
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-800 leading-tight">
              Empower Your AI Innovations with Neuraloom
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              The leading platform for seamless neural network integration,
              analytics, and scalable deployment.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href={"/auth"}
                className="btn bg-blue-800 text-white hover:bg-blue-700 px-8 py-3 rounded-md font-medium transition-colors"
              >
                Get Started
              </Link>
              <Link
                href={"/learn-more"}
                className="btn bg-transparent border border-blue-800 text-blue-800 hover:bg-blue-50 px-8 py-3 rounded-md font-medium transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">10K+</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">500+</h3>
              <p className="text-gray-600">Integrations</p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">99.9%</h3>
              <p className="text-gray-600">Uptime</p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">24/7</h3>
              <p className="text-gray-600">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-800">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                AI Integration
              </h3>
              <p className="text-gray-600">
                Seamlessly weave multiple AI models into powerful neural
                networks for tailored solutions.
              </p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                Real-Time Analytics
              </h3>
              <p className="text-gray-600">
                Monitor and optimize AI workflows with advanced, actionable
                insights.
              </p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                Scalable Deployment
              </h3>
              <p className="text-gray-600">
                Effortlessly scale across cloud, edge, or hybrid environments
                with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <Image
              src="https://www.shutterstock.com/image-photo/ai-powers-integration-smart-ecosystems-600nw-2662936595.jpg"
              alt="Neuraloom Platform"
              width={600}
              height={400}
              className="rounded-lg shadow-md border border-gray-200/50"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold mb-6 text-blue-800">
              About Neuraloom
            </h2>
            <p className="text-gray-600 mb-4">
              Neuraloom is a pioneering AI platform designed to simplify the
              development and deployment of advanced neural networks.
            </p>
            <p className="text-gray-600 mb-4">
              Since 2023, we’ve empowered thousands of professionals across
              industries like healthcare, finance, and technology to innovate
              with AI.
            </p>
            <p className="text-gray-600">
              Our mission is to deliver secure, efficient, and scalable AI
              solutions that drive progress and transform industries.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-800">
            Pricing Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm text-center hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                Starter
              </h3>
              <p className="text-4xl font-bold mb-6 text-blue-800">
                $0<span className="text-lg">/mo</span>
              </p>
              <ul className="text-gray-600 mb-8 space-y-2">
                <li>Basic AI integration tools</li>
                <li>Limited analytics dashboard</li>
                <li>Community support</li>
              </ul>
              <button className="btn bg-blue-800 text-white hover:bg-blue-700 w-full py-3 rounded-md font-medium transition-colors">
                Sign Up
              </button>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-md text-center relative">
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-800 text-white text-xs font-semibold px-4 py-1 rounded-full">
                Recommended
              </span>
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                Professional
              </h3>
              <p className="text-4xl font-bold mb-6 text-blue-800">
                $49<span className="text-lg">/mo</span>
              </p>
              <ul className="text-gray-600 mb-8 space-y-2">
                <li>Advanced AI integrations</li>
                <li>Full analytics suite</li>
                <li>Priority support</li>
              </ul>
              <button className="btn bg-blue-800 text-white hover:bg-blue-700 w-full py-3 rounded-md font-medium transition-colors">
                Sign Up
              </button>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm text-center hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                Enterprise
              </h3>
              <p className="text-4xl font-bold mb-6 text-blue-800">Custom</p>
              <ul className="text-gray-600 mb-8 space-y-2">
                <li>Tailored AI solutions</li>
                <li>Dedicated infrastructure</li>
                <li>24/7 premium support</li>
              </ul>
              <button className="btn bg-blue-800 text-white hover:bg-blue-700 w-full py-3 rounded-md font-medium transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-800">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm">
              <p className="text-gray-600 mb-4">
                "Neuraloom has streamlined our AI development, saving us time
                and resources."
              </p>
              <p className="font-semibold text-blue-800">
                - Dr. Elena Vasquez, AI Researcher
              </p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm">
              <p className="text-gray-600 mb-4">
                "A professional-grade platform with unmatched reliability and
                support."
              </p>
              <p className="font-semibold text-blue-800">
                - Mark Thompson, CTO
              </p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-8 shadow-sm">
              <p className="text-gray-600 mb-4">
                "Scalable and intuitive, perfect for our growing business
                needs."
              </p>
              <p className="font-semibold text-blue-800">
                - Sarah Lee, Director
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-blue-800">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">
                What is Neuraloom?
              </h3>
              <p className="text-gray-600">
                Neuraloom is a platform for building, integrating, and deploying
                advanced neural networks with ease.
              </p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">
                How secure is the platform?
              </h3>
              <p className="text-gray-600">
                We employ industry-leading encryption and compliance standards
                to protect your data and models.
              </p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-blue-800">
                How can I get started?
              </h3>
              <p className="text-gray-600">
                Sign up for a free account and access our comprehensive
                tutorials and documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6 text-blue-800">
            Ready to Transform Your AI Projects?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Neuraloom today and experience professional-grade AI tools.
          </p>
          <button className="btn bg-blue-800 text-white hover:bg-blue-700 px-8 py-3 rounded-md font-medium transition-colors">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}
