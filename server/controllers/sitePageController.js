const SitePage = require("../models/SitePage");

const defaultPages = {
  about: {
    page: "about",
    hero: {
      eyebrow: "About / Brand Story",
      title: "About Us",
      subtitle:
        "Your trusted fashion destination with quality, style, and comfort in every piece.",
      badge: "Crafted for Everyday Wear",
    },
    content: {
      introTitle: "Who We Are",
      introText:
        "We are a modern fashion brand committed to creating high-quality apparel with comfort, style, and durability. Our mission is to bring premium streetwear and everyday essentials at affordable prices while keeping every piece wearable, reliable, and easy to love.",
      featureTitle: "What Makes Us Different",
      featureText:
        "From concept to creation, we obsess over the details: fabric weight, fit, print quality, and long-term comfort. We do not just make clothes, we build pieces you will want to live in.",
      commitmentTitle: "Our Commitment",
      commitmentText:
        "Every product goes through multiple quality checks, from fabric selection to stitching to packaging. Our designs are built for daily comfort while still feeling current and expressive.",
      commitmentPoints: [
        "Premium fabric quality",
        "Eco-friendly printing",
        "Trend-led streetwear designs",
        "Accessible pricing",
        "Fast delivery and easy returns",
      ],
      featureImage:
        "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?q=80&w=1400",
      journeyTitle: "Our Journey",
      journeyText:
        "Built with passion for fashion and a mission to redefine everyday wear, our brand started with a simple idea: good clothes should be comfortable, stylish, and accessible to everyone.",
      milestones: [
        {
          label: "The Idea",
          title: "Started with a Vision",
          text: "A small team with one goal: everyday wear that actually feels premium.",
        },
        {
          label: "The Growth",
          title: "Community First",
          text: "Feedback from real customers helped us refine our fits and designs.",
        },
        {
          label: "Today",
          title: "Growing with You",
          text: "We continue to expand collections while staying true to comfort and quality.",
        },
      ],
      stats: [
        { value: "50K+", label: "Happy Customers" },
        { value: "500+", label: "Premium Products" },
        { value: "4.8/5", label: "Customer Rating" },
      ],
      ctaTitle: "Ready to Explore Our Collection?",
      ctaText: "Discover premium fashion made for comfort and style.",
      ctaLabel: "Shop Now",
      ctaLink: "/shop",
    },
  },
  blog: {
    page: "blog",
    hero: {
      eyebrow: "Blog / Style Journal",
      title: "Our Blog",
      subtitle: "Fashion tips, style guides, trends, and inspiration from the PrintedTeez world.",
      badge: "Fresh Drops Weekly",
    },
    content: {
      sectionTitle: "Latest Articles",
      sectionText:
        "Use this space to highlight editorial updates, launches, and evergreen style guidance for your shoppers.",
      posts: [
        {
          id: "streetwear-trends-2025",
          title: "Top 10 Streetwear Trends of 2025",
          excerpt:
            "Streetwear continues to evolve with bold graphics, oversized fits, and future-facing fabrics. Here are the standout directions shaping this year.",
          image:
            "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?q=80&w=1200",
          date: "Jan 2025",
          link: "/shop",
        },
        {
          id: "oversized-tee-fit-guide",
          title: "How to Choose the Perfect Oversized T-Shirt",
          excerpt:
            "Oversized tees are everywhere. Learn how to pick the right fit, fabric, and silhouette for your wardrobe.",
          image:
            "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200",
          date: "Feb 2025",
          link: "/shop",
        },
        {
          id: "wardrobe-basics",
          title: "5 Essential Wardrobe Basics for Men",
          excerpt:
            "A strong wardrobe starts with dependable basics. These pieces help you build more looks with less effort.",
          image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200",
          date: "Mar 2025",
          link: "/shop",
        },
      ],
      ctaTitle: "Want More Fashion Tips?",
      ctaText: "Stay updated with weekly style tips, trend alerts, and guides.",
      ctaLabel: "Shop Now",
      ctaLink: "/shop",
    },
  },
  contact: {
    page: "contact",
    hero: {
      eyebrow: "Contact / Support",
      title: "Contact Us",
      subtitle: "Reach out for support, order help, collaboration requests, or product questions.",
      badge: "We reply within 24 hours",
    },
    content: {
      formTitle: "Send a Message",
      formIntro:
        "Have a question about an order, product, or collaboration? Share the details and we will get back to you as soon as possible.",
      infoTitle: "Get In Touch",
      infoIntro:
        "Prefer talking directly? Reach us through email, phone, address, or social channels.",
      email: "support@printedteez.com",
      phone: "+91 98765 43210",
      address: "Kochi, Kerala, India",
      chips: ["Order Support", "Bulk / Corporate", "Collaboration"],
      socials: [
        { label: "Facebook", url: "https://facebook.com" },
        { label: "Instagram", url: "https://instagram.com" },
        { label: "WhatsApp", url: "https://wa.me/919876543210" },
      ],
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62938.32731854086!2d76.2517649!3d9.9816356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d036df59d63%3A0xa0e99dbd7a73a0e9!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1706776777003!5m2!1sen!2sin",
      responseNote:
        "By submitting, you agree to be contacted regarding your inquiry.",
    },
  },
};

const validPages = Object.keys(defaultPages);

const normalizePage = (page = "") => String(page).trim().toLowerCase();

const getDefaultPage = (page) => {
  const normalized = normalizePage(page);
  return defaultPages[normalized] ? JSON.parse(JSON.stringify(defaultPages[normalized])) : null;
};

const getOrCreateSitePage = async (page) => {
  const normalized = normalizePage(page);
  const fallback = getDefaultPage(normalized);

  if (!fallback) {
    return null;
  }

  let doc = await SitePage.findOne({ page: normalized });

  if (!doc) {
    doc = await SitePage.create(fallback);
  }

  return doc;
};

const getSitePage = async (req, res) => {
  try {
    const page = normalizePage(req.params.page);

    if (!validPages.includes(page)) {
      return res.status(404).json({ message: "Page not found" });
    }

    const sitePage = await getOrCreateSitePage(page);
    return res.json(sitePage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminSitePages = async (_req, res) => {
  try {
    const pages = await Promise.all(validPages.map((page) => getOrCreateSitePage(page)));
    return res.json(pages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSitePage = async (req, res) => {
  try {
    const page = normalizePage(req.params.page);

    if (!validPages.includes(page)) {
      return res.status(404).json({ message: "Page not found" });
    }

    const existing = await getOrCreateSitePage(page);
    existing.hero = {
      eyebrow: req.body?.hero?.eyebrow || "",
      title: req.body?.hero?.title || "",
      subtitle: req.body?.hero?.subtitle || "",
      badge: req.body?.hero?.badge || "",
    };
    existing.content = req.body?.content || {};

    await existing.save();

    return res.json(existing);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSitePage,
  getAdminSitePages,
  updateSitePage,
};
