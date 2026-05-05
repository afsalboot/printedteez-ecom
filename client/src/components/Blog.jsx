import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getSitePage } from "../redux/slices/sitePageSlice.jsx";

const Blog = () => {
  const dispatch = useDispatch();
  const { pages = {}, loading } = useSelector((state) => state.sitePages);
  const blogPage = pages.blog;
  const hero = blogPage?.hero || {};
  const content = blogPage?.content || {};
  const posts = Array.isArray(content.posts) ? content.posts : [];

  useEffect(() => {
    if (!blogPage) {
      dispatch(getSitePage("blog"));
    }
  }, [blogPage, dispatch]);

  return (
    <div className="w-full bg-transparent text-slate-900 dark:text-slate-100">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#B21A15] via-[#c5261f] to-red-700 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_70%)]" />
        <div className="relative mx-auto flex min-h-[280px] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[320px]">
          <p className="text-xs uppercase tracking-[0.34em] text-white/75">
            {hero.eyebrow || "Blog / Style Journal"}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {hero.title || "Our Blog"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            {hero.subtitle || "Loading blog content..."}
          </p>
          <span className="mt-5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] backdrop-blur-sm">
            {hero.badge || "Fresh Drops Weekly"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">
              {content.sectionTitle || "Latest Articles"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              {content.sectionText || "Fresh editorial content from the brand."}
            </p>
          </div>
          {!blogPage && loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading content...</p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post.id || `${post.title}-${index}`}
              className="group overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.07]"
            >
              <div className="overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {post.date}
                </span>
                <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-950 dark:text-white">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {post.excerpt}
                </p>
                <Link
                  to={post.link || "/shop"}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#B21A15] transition hover:text-[#97150f]"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="bg-white/65 py-14 text-center dark:bg-white/[0.03]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
            {content.ctaTitle || "Want More Fashion Tips?"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            {content.ctaText || "Stay updated with weekly style tips, trend alerts, and guides."}
          </p>
          <Link
            to={content.ctaLink || "/shop"}
            className="mt-6 inline-flex rounded-full bg-[#B21A15] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(178,26,21,0.25)] transition hover:bg-[#97150f]"
          >
            {content.ctaLabel || "Shop Now"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;
