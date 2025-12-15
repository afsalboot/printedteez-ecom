import React from "react";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Streetwear Trends of 2025",
    excerpt:
      "Streetwear continues to evolve with bold graphics, oversized fits, and futuristic fabrics. Here are the hottest trends this year.",
    image:
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?q=80&w=1200",
    date: "Jan 2025",
  },
  {
    id: 2,
    title: "How to Choose the Perfect Oversized T-Shirt",
    excerpt:
      "Oversized tees are everywhere. Learn how to pick the best fit, fabric, and style based on your body type.",
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200",
    date: "Feb 2025",
  },
  {
    id: 3,
    title: "5 Essential Wardrobe Basics for Men",
    excerpt:
      "A clean wardrobe starts with the basics. Here are must-have items that create the perfect foundation for any look.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200",
    date: "Mar 2025",
  },
];

const Blog = () => {
  return (
    <div className="w-full bg-white">

      {/* HEADER */}
      <div className="w-full h-64 bg-gradient-to-r from-[#B21A15] to-red-700 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_70%)]" />

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide relative">
          Our Blog
        </h1>
        <p className="text-sm md:text-base mt-3 opacity-95 relative">
          Fashion tips, style guides, trends and more.
        </p>

        <span className="mt-4 px-4 py-1 rounded-full text-[11px] border border-white/30 bg-white/10 backdrop-blur-sm tracking-widest uppercase relative">
          Fresh Drops Weekly
        </span>
      </div>

      {/* BLOG GRID */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
          Latest Articles
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              {/* Image with hover zoom */}
              <div className="overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-3">
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  {post.date}
                </span>

                <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {post.excerpt}
                </p>

                <a
                  href={`/blog/${post.id}`}
                  className="mt-2 text-[#B21A15] text-sm font-medium flex items-center gap-1 hover:underline underline-offset-4"
                >
                  Read More
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-gray-50 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Want More Fashion Tips?
        </h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Stay updated with weekly style tips, trend alerts, and guides.
        </p>

        <a
          href="/shop"
          className="inline-block bg-[#B21A15] text-white px-10 py-3.5 mt-6 rounded-full text-lg font-medium shadow-md hover:opacity-90 hover:translate-y-[1px] active:translate-y-0 transition-all"
        >
          Shop Now
        </a>
      </div>
    </div>
  );
};

export default Blog;
