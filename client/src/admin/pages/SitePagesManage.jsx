import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSitePageMessage,
  getAdminSitePages,
  updateSitePage,
} from "../../redux/slices/sitePageSlice.jsx";
import { FileText, Globe, Mail, Newspaper, Plus, Save, Trash2 } from "lucide-react";

const pageOptions = [
  { key: "about", label: "About", icon: Globe },
  { key: "blog", label: "Blog", icon: Newspaper },
  { key: "contact", label: "Contact", icon: Mail },
];

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white";
const textareaClass = `${inputClass} min-h-[120px] resize-y`;
const labelClass = "text-sm font-semibold text-slate-800";

const emptyPage = {
  hero: { eyebrow: "", title: "", subtitle: "", badge: "" },
  content: {},
};

const arrayValue = (value) => (Array.isArray(value) ? value : []);

const SitePagesManage = () => {
  const dispatch = useDispatch();
  const { pages = {}, loading, error, message } = useSelector((state) => state.sitePages);
  const [activePage, setActivePage] = useState("about");
  const [form, setForm] = useState(emptyPage);

  useEffect(() => {
    dispatch(getAdminSitePages());
  }, [dispatch]);

  const currentPage = pages[activePage] || emptyPage;

  useEffect(() => {
    setForm({
      hero: {
        eyebrow: currentPage.hero?.eyebrow || "",
        title: currentPage.hero?.title || "",
        subtitle: currentPage.hero?.subtitle || "",
        badge: currentPage.hero?.badge || "",
      },
      content: { ...(currentPage.content || {}) },
    });
  }, [currentPage]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => dispatch(clearSitePageMessage()), 2500);
    return () => window.clearTimeout(timer);
  }, [dispatch, message]);

  const setHeroField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const setContentField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value },
    }));
  };

  const addArrayItem = (field, nextValue) => {
    const items = arrayValue(form.content?.[field]);
    setContentField(field, [...items, nextValue]);
  };

  const updateArrayItem = (field, index, key, value) => {
    const items = arrayValue(form.content?.[field]).map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (typeof item === "string") return value;
      return { ...item, [key]: value };
    });
    setContentField(field, items);
  };

  const removeArrayItem = (field, index) => {
    const items = arrayValue(form.content?.[field]).filter((_, itemIndex) => itemIndex !== index);
    setContentField(field, items);
  };

  const pageStats = useMemo(
    () =>
      pageOptions.map((option) => ({
        ...option,
        ready: Boolean(pages[option.key]),
      })),
    [pages]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateSitePage(activePage, form));
  };

  const renderHeroFields = () => (
    <section className={cardClass}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1ec] text-[#B21A15]">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Hero Content</h2>
          <p className="text-sm text-slate-500">Control the page header copy and badge.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            className={`${inputClass} mt-2`}
            value={form.hero.eyebrow}
            onChange={(e) => setHeroField("eyebrow", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input
            className={`${inputClass} mt-2`}
            value={form.hero.badge}
            onChange={(e) => setHeroField("badge", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Title</label>
        <input
          className={`${inputClass} mt-2`}
          value={form.hero.title}
          onChange={(e) => setHeroField("title", e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className={labelClass}>Subtitle</label>
        <textarea
          className={`${textareaClass} mt-2`}
          value={form.hero.subtitle}
          onChange={(e) => setHeroField("subtitle", e.target.value)}
        />
      </div>
    </section>
  );

  const renderAboutEditor = () => (
    <>
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-950">Core Story</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Intro Title</label>
            <input className={`${inputClass} mt-2`} value={form.content.introTitle || ""} onChange={(e) => setContentField("introTitle", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Feature Title</label>
            <input className={`${inputClass} mt-2`} value={form.content.featureTitle || ""} onChange={(e) => setContentField("featureTitle", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Intro Text</label>
          <textarea className={`${textareaClass} mt-2`} value={form.content.introText || ""} onChange={(e) => setContentField("introText", e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Feature Text</label>
          <textarea className={`${textareaClass} mt-2`} value={form.content.featureText || ""} onChange={(e) => setContentField("featureText", e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Feature Image URL</label>
          <input className={`${inputClass} mt-2`} value={form.content.featureImage || ""} onChange={(e) => setContentField("featureImage", e.target.value)} />
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-950">Commitment</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Commitment Title</label>
            <input className={`${inputClass} mt-2`} value={form.content.commitmentTitle || ""} onChange={(e) => setContentField("commitmentTitle", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Journey Title</label>
            <input className={`${inputClass} mt-2`} value={form.content.journeyTitle || ""} onChange={(e) => setContentField("journeyTitle", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Commitment Text</label>
          <textarea className={`${textareaClass} mt-2`} value={form.content.commitmentText || ""} onChange={(e) => setContentField("commitmentText", e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelClass}>Journey Text</label>
          <textarea className={`${textareaClass} mt-2`} value={form.content.journeyText || ""} onChange={(e) => setContentField("journeyText", e.target.value)} />
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800">Commitment Points</h3>
            <button type="button" onClick={() => addArrayItem("commitmentPoints", "")} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              <Plus className="h-4 w-4" />
              Add Point
            </button>
          </div>
          {arrayValue(form.content.commitmentPoints).map((point, index) => (
            <div key={`point-${index}`} className="flex gap-3">
              <input className={inputClass} value={point} onChange={(e) => updateArrayItem("commitmentPoints", index, null, e.target.value)} />
              <button type="button" onClick={() => removeArrayItem("commitmentPoints", index)} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Milestones</h2>
          <button type="button" onClick={() => addArrayItem("milestones", { label: "", title: "", text: "" })} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            <Plus className="h-4 w-4" />
            Add Milestone
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {arrayValue(form.content.milestones).map((item, index) => (
            <div key={`milestone-${index}`} className="rounded-[1.4rem] border border-slate-200 bg-[#fbfaf7] p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input className={inputClass} placeholder="Label" value={item.label || ""} onChange={(e) => updateArrayItem("milestones", index, "label", e.target.value)} />
                <input className={inputClass} placeholder="Title" value={item.title || ""} onChange={(e) => updateArrayItem("milestones", index, "title", e.target.value)} />
              </div>
              <textarea className={`${textareaClass} mt-4`} placeholder="Text" value={item.text || ""} onChange={(e) => updateArrayItem("milestones", index, "text", e.target.value)} />
              <button type="button" onClick={() => removeArrayItem("milestones", index)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Stats and CTA</h2>
          <button type="button" onClick={() => addArrayItem("stats", { value: "", label: "" })} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            <Plus className="h-4 w-4" />
            Add Stat
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {arrayValue(form.content.stats).map((item, index) => (
            <div key={`stat-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto]">
              <input className={inputClass} placeholder="Value" value={item.value || ""} onChange={(e) => updateArrayItem("stats", index, "value", e.target.value)} />
              <input className={inputClass} placeholder="Label" value={item.label || ""} onChange={(e) => updateArrayItem("stats", index, "label", e.target.value)} />
              <button type="button" onClick={() => removeArrayItem("stats", index)} className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className={inputClass} placeholder="CTA Title" value={form.content.ctaTitle || ""} onChange={(e) => setContentField("ctaTitle", e.target.value)} />
          <input className={inputClass} placeholder="CTA Label" value={form.content.ctaLabel || ""} onChange={(e) => setContentField("ctaLabel", e.target.value)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <textarea className={textareaClass} placeholder="CTA Text" value={form.content.ctaText || ""} onChange={(e) => setContentField("ctaText", e.target.value)} />
          <input className={inputClass} placeholder="CTA Link" value={form.content.ctaLink || ""} onChange={(e) => setContentField("ctaLink", e.target.value)} />
        </div>
      </section>
    </>
  );

  const renderBlogEditor = () => (
    <>
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-950">Blog Intro</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input className={inputClass} placeholder="Section Title" value={form.content.sectionTitle || ""} onChange={(e) => setContentField("sectionTitle", e.target.value)} />
          <input className={inputClass} placeholder="CTA Title" value={form.content.ctaTitle || ""} onChange={(e) => setContentField("ctaTitle", e.target.value)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <textarea className={textareaClass} placeholder="Section Text" value={form.content.sectionText || ""} onChange={(e) => setContentField("sectionText", e.target.value)} />
          <textarea className={textareaClass} placeholder="CTA Text" value={form.content.ctaText || ""} onChange={(e) => setContentField("ctaText", e.target.value)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input className={inputClass} placeholder="CTA Label" value={form.content.ctaLabel || ""} onChange={(e) => setContentField("ctaLabel", e.target.value)} />
          <input className={inputClass} placeholder="CTA Link" value={form.content.ctaLink || ""} onChange={(e) => setContentField("ctaLink", e.target.value)} />
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Blog Posts</h2>
          <button type="button" onClick={() => addArrayItem("posts", { id: "", title: "", excerpt: "", image: "", date: "", link: "" })} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            <Plus className="h-4 w-4" />
            Add Post
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {arrayValue(form.content.posts).map((item, index) => (
            <div key={`post-${index}`} className="rounded-[1.4rem] border border-slate-200 bg-[#fbfaf7] p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input className={inputClass} placeholder="Post ID or slug" value={item.id || ""} onChange={(e) => updateArrayItem("posts", index, "id", e.target.value)} />
                <input className={inputClass} placeholder="Date label" value={item.date || ""} onChange={(e) => updateArrayItem("posts", index, "date", e.target.value)} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input className={inputClass} placeholder="Title" value={item.title || ""} onChange={(e) => updateArrayItem("posts", index, "title", e.target.value)} />
                <input className={inputClass} placeholder="Link" value={item.link || ""} onChange={(e) => updateArrayItem("posts", index, "link", e.target.value)} />
              </div>
              <div className="mt-4">
                <input className={inputClass} placeholder="Image URL" value={item.image || ""} onChange={(e) => updateArrayItem("posts", index, "image", e.target.value)} />
              </div>
              <div className="mt-4">
                <textarea className={textareaClass} placeholder="Excerpt" value={item.excerpt || ""} onChange={(e) => updateArrayItem("posts", index, "excerpt", e.target.value)} />
              </div>
              <button type="button" onClick={() => removeArrayItem("posts", index)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderContactEditor = () => (
    <>
      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-950">Contact Details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input className={inputClass} placeholder="Form Title" value={form.content.formTitle || ""} onChange={(e) => setContentField("formTitle", e.target.value)} />
          <input className={inputClass} placeholder="Info Title" value={form.content.infoTitle || ""} onChange={(e) => setContentField("infoTitle", e.target.value)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <textarea className={textareaClass} placeholder="Form Intro" value={form.content.formIntro || ""} onChange={(e) => setContentField("formIntro", e.target.value)} />
          <textarea className={textareaClass} placeholder="Info Intro" value={form.content.infoIntro || ""} onChange={(e) => setContentField("infoIntro", e.target.value)} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input className={inputClass} placeholder="Email" value={form.content.email || ""} onChange={(e) => setContentField("email", e.target.value)} />
          <input className={inputClass} placeholder="Phone" value={form.content.phone || ""} onChange={(e) => setContentField("phone", e.target.value)} />
        </div>
        <div className="mt-4">
          <input className={inputClass} placeholder="Address" value={form.content.address || ""} onChange={(e) => setContentField("address", e.target.value)} />
        </div>
        <div className="mt-4">
          <input className={inputClass} placeholder="Google map embed URL" value={form.content.mapEmbedUrl || ""} onChange={(e) => setContentField("mapEmbedUrl", e.target.value)} />
        </div>
        <div className="mt-4">
          <textarea className={textareaClass} placeholder="Response Note" value={form.content.responseNote || ""} onChange={(e) => setContentField("responseNote", e.target.value)} />
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Support Chips</h2>
          <button type="button" onClick={() => addArrayItem("chips", "")} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            <Plus className="h-4 w-4" />
            Add Chip
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {arrayValue(form.content.chips).map((chip, index) => (
            <div key={`chip-${index}`} className="flex gap-3">
              <input className={inputClass} value={chip} onChange={(e) => updateArrayItem("chips", index, null, e.target.value)} />
              <button type="button" onClick={() => removeArrayItem("chips", index)} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Social Links</h2>
          <button type="button" onClick={() => addArrayItem("socials", { label: "", url: "" })} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            <Plus className="h-4 w-4" />
            Add Social
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {arrayValue(form.content.socials).map((item, index) => (
            <div key={`social-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto]">
              <input className={inputClass} placeholder="Label" value={item.label || ""} onChange={(e) => updateArrayItem("socials", index, "label", e.target.value)} />
              <input className={inputClass} placeholder="URL" value={item.url || ""} onChange={(e) => updateArrayItem("socials", index, "url", e.target.value)} />
              <button type="button" onClick={() => removeArrayItem("socials", index)} className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <div className="rounded-[28px] border border-red-100/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:rounded-[32px] sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#B21A15]">
              Storefront / Content Pages
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Site Pages
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Manage the content for About, Blog, and Contact directly from the admin panel.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {pageStats.map(({ key, label, icon: Icon, ready }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActivePage(key)}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                  activePage === key
                    ? "bg-[#B21A15] text-white shadow-[0_14px_34px_rgba(178,26,21,0.24)]"
                    : "border border-red-100 bg-white text-slate-700 hover:bg-[#fff8f5]",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${activePage === key ? "bg-white/15" : ready ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {ready ? "Live" : "Draft"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Managed Pages</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{Object.keys(pages).length || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Current Page</p>
            <p className="mt-2 text-xl font-semibold capitalize text-slate-950">{activePage}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Status</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{loading ? "Syncing" : "Ready"}</p>
          </div>
        </div>

        {(error || message) && (
          <div className="mt-5 space-y-2">
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {renderHeroFields()}
          {activePage === "about" ? renderAboutEditor() : null}
          {activePage === "blog" ? renderBlogEditor() : null}
          {activePage === "contact" ? renderContactEditor() : null}

          <div className="sticky bottom-4 z-10 flex justify-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B21A15] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(178,26,21,0.28)] transition hover:bg-[#97150f] sm:w-auto"
            >
              <Save className="h-4 w-4" />
              Save {activePage.charAt(0).toUpperCase() + activePage.slice(1)} Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SitePagesManage;
