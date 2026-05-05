import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getSitePage } from "../redux/slices/sitePageSlice.jsx";

const About = () => {
  const dispatch = useDispatch();
  const { pages = {}, loading } = useSelector((state) => state.sitePages);
  const aboutPage = pages.about;
  const hero = aboutPage?.hero || {};
  const content = aboutPage?.content || {};
  const commitmentPoints = Array.isArray(content.commitmentPoints) ? content.commitmentPoints : [];
  const milestones = Array.isArray(content.milestones) ? content.milestones : [];
  const stats = Array.isArray(content.stats) ? content.stats : [];

  useEffect(() => {
    if (!aboutPage) {
      dispatch(getSitePage("about"));
    }
  }, [aboutPage, dispatch]);

  return (
    <div className="w-full bg-transparent text-slate-900 dark:text-slate-100">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#B21A15] via-[#c5261f] to-red-700 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent_70%)]" />
        <div className="relative mx-auto flex min-h-[300px] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[340px]">
          <p className="text-xs uppercase tracking-[0.34em] text-white/75">
            {hero.eyebrow || "About / Brand Story"}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {hero.title || "About Us"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            {hero.subtitle || "Loading brand story..."}
          </p>
          <span className="mt-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur-sm">
            {hero.badge || "Crafted for Everyday Wear"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
              {content.introTitle || "Who We Are"}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              {content.introText || "Loading story..."}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {content.featureTitle || "What Makes Us Different"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {content.featureText || "Loading details..."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 py-10 dark:bg-white/[0.03] sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">
              {content.commitmentTitle || "Our Commitment"}
            </h3>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              {content.commitmentText || "Loading commitment..."}
            </p>

            <ul className="mt-6 space-y-3">
              {commitmentPoints.map((text, index) => (
                <li
                  key={`${text}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B21A15]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/40 shadow-[0_26px_70px_rgba(15,23,42,0.14)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#B21A15]/15 via-transparent to-transparent" />
              <img
                src={content.featureImage}
                alt={content.featureTitle || "About feature"}
                className="h-[280px] w-full object-cover sm:h-[420px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
          {content.journeyTitle || "Our Journey"}
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600 dark:text-slate-300">
          {content.journeyText || "Loading journey..."}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {milestones.map((item, index) => (
            <div
              key={`${item.title || "milestone"}-${index}`}
              className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.05]"
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#170f12] via-[#291519] to-[#3a1716] py-12 text-white sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 text-center sm:px-6 md:grid-cols-3">
          {stats.map((item, index) => (
            <div key={`${item.label || "stat"}-${index}`}>
              <h3 className="text-4xl font-extrabold sm:text-5xl">{item.value}</h3>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/75">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">
          {content.ctaTitle || "Ready to Explore Our Collection?"}
        </h2>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
          {content.ctaText || "Discover premium fashion made for comfort and style."}
        </p>
        <Link
          to={content.ctaLink || "/shop"}
          className="mt-7 inline-flex rounded-full bg-[#B21A15] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(178,26,21,0.25)] transition hover:bg-[#97150f]"
        >
          {content.ctaLabel || "Shop Now"}
        </Link>

        {!aboutPage && loading ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading page content...</p>
        ) : null}
      </div>
    </div>
  );
};

export default About;
