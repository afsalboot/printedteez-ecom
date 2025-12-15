import React from "react";
import { CheckCircle } from "lucide-react";

const About = () => {
  return (
    <div className="w-full bg-white">
      {/* HEADER BANNER */}
      <div className="w-full h-72 bg-gradient-to-r from-[#B21A15] to-red-700 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
        {/* soft glow */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />
        <div className="relative px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide drop-shadow">
            About Us
          </h1>
          <p className="text-sm md:text-base mt-3 opacity-95 max-w-xl mx-auto leading-relaxed">
            Your trusted fashion destination – quality, style & comfort in every piece.
          </p>
          <span className="inline-flex mt-4 px-4 py-1 rounded-full border border-white/40 text-xs uppercase tracking-[0.2em] bg-white/10 backdrop-blur-sm">
            Crafted for Everyday Wear
          </span>
        </div>
      </div>

      {/* SECTION 1: WHO WE ARE */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Who We Are
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              We are a modern fashion brand committed to creating high-quality apparel 
              with comfort, style, and durability. Our mission is to bring premium 
              streetwear and everyday essentials at affordable prices. With a strong 
              focus on fabric quality, craftsmanship, and design, we ensure every 
              product feels as good as it looks.
            </p>
          </div>

          {/* Small highlight card */}
          <div className="bg-gray-50 rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              What Makes Us Different
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              From concept to creation, we obsess over the details – fabric weight, fit,
              print quality, and long-term comfort. We don’t just make clothes, we build
              pieces you’ll want to live in.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: IMAGE + TEXT */}
      <div className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              Our Commitment
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              We ensure that every product goes through multiple quality checks, 
              from fabric selection to stitching to packaging. Our designs are 
              crafted for daily comfort while staying trendy and stylish.
            </p>

            <ul className="mt-5 space-y-3">
              {[
                "Premium fabric quality",
                "Eco-friendly printing",
                "Trendy streetwear designs",
                "Affordable pricing",
                "Fast delivery & easy returns",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-gray-700 text-sm md:text-base"
                >
                  <CheckCircle className="text-[#B21A15]" size={20} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative h-80 w-full">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#B21A15]/10 to-red-500/10 blur-sm" />
              <img
                src="https://images.unsplash.com/photo-1521335629791-ce4aec67dd47"
                alt="fashion"
                className="relative rounded-2xl shadow-md object-cover h-80 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: OUR JOURNEY */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Our Journey
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Built with passion for fashion and a mission to redefine everyday wear, 
          our brand started with a simple idea: good clothes should be comfortable, 
          stylish, and accessible to everyone. Today, we proudly serve thousands 
          of customers with high-quality T-shirts, hoodies, and more.
        </p>

        {/* simple timeline / milestones */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
              The Idea
            </p>
            <h4 className="font-semibold text-gray-900 mb-2">
              Started with a Vision
            </h4>
            <p className="text-sm text-gray-600">
              A small team with one goal: everyday wear that actually feels premium.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
              The Growth
            </p>
            <h4 className="font-semibold text-gray-900 mb-2">
              Community First
            </h4>
            <p className="text-sm text-gray-600">
              Feedback from real customers helped us refine our fits and designs.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
              Today
            </p>
            <h4 className="font-semibold text-gray-900 mb-2">
              Growing with You
            </h4>
            <p className="text-sm text-gray-600">
              We continue to expand collections while staying true to comfort & quality.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: STATS */}
      <div className="bg-gradient-to-r from-[#B21A15] to-red-700 text-white py-12 md:py-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center px-6">
          <div className="flex flex-col items-center">
            <h3 className="text-4xl md:text-5xl font-extrabold">50K+</h3>
            <p className="text-sm opacity-90 mt-2 tracking-wide">
              Happy Customers
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-4xl md:text-5xl font-extrabold">500+</h3>
            <p className="text-sm opacity-90 mt-2 tracking-wide">
              Premium Products
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-4xl md:text-5xl font-extrabold">4.8⭐</h3>
            <p className="text-sm opacity-90 mt-2 tracking-wide">
              Customer Rating
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: CTA */}
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Ready to Explore Our Collection?
        </h2>
        <p className="text-gray-600 mt-3 text-lg">
          Discover premium fashion made for comfort & style.
        </p>
        <a
          href="/shop"
          className="inline-block bg-[#B21A15] text-white px-10 py-3.5 mt-7 rounded-full text-lg font-medium hover:opacity-90 hover:translate-y-[1px] active:translate-y-0 transition-all shadow-md"
        >
          Shop Now
        </a>
      </div>
    </div>
  );
};

export default About;
