import React, { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  FiPlus,
  FiArrowUpRight,
  FiMessageCircle,
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiPackage,
  FiRefreshCw,
  FiHelpCircle,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useNx } from "../nxUtils";
import "./NxFaq.css";

/* ---------------------------------------------------------
   HERO BACKGROUND IMAGE
   Option 1: keep this online image (works right away)
   Option 2: put your own image in src/assets and use:
       import heroImg from "../assets/faq-hero.jpg";
       const HERO_IMAGE = heroImg;
--------------------------------------------------------- */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=80";

const categories = [
  { id: "ordering", label: "Ordering", number: "01", icon: FiShoppingBag },
  { id: "payment", label: "Payment", number: "02", icon: FiCreditCard },
  { id: "delivery", label: "Delivery", number: "03", icon: FiTruck },
  { id: "products", label: "Products", number: "04", icon: FiPackage },
  { id: "returns", label: "Returns", number: "05", icon: FiRefreshCw },
  { id: "other", label: "Other", number: "06", icon: FiHelpCircle },
];

const marqueeWords = [
  "ORDERS",
  "PAYMENTS",
  "DELIVERY",
  "SIZE GUIDE",
  "RETURNS",
  "SUPPORT",
];

const heroStats = [
  { value: "24/7", label: "WHATSAPP HELP" },
  { value: "06", label: "HELP TOPICS" },
  { value: "100%", label: "FRIENDLY TEAM" },
];

const makeFaqs = (nx) => {
  const freeShippingAbove = Number(nx?.freeShippingAbove || 999);
  const shippingFee = Number(nx?.shippingFee || 50);

  return {
    ordering: [
      {
        q: "How can I place an order?",
        a: "Browse our collection, choose your favourite shirt, select your size and add it to your cart. Continue to checkout and follow the steps to complete your order.",
      },
      {
        q: "Can I order without creating an account?",
        a: "Yes. You can continue with the available checkout options. Enter the correct contact and delivery details so we can process your order.",
      },
      {
        q: "Can I change my order after placing it?",
        a: "If your order has not been packed or dispatched, contact our support team as soon as possible. We will check whether the requested change can be made.",
      },
    ],

    payment: [
      {
        q: "What payment methods are accepted?",
        a: "Available payment methods will be displayed during checkout. Choose one of the options shown there to complete your purchase.",
      },
      {
        q: "Is online payment safe?",
        a: "Please complete payments only through the official payment options shown on our website. Never share your OTP, PIN or banking password with anyone.",
      },
      {
        q: "Will I receive an order confirmation?",
        a: "After a successful order, check the confirmation displayed on the website and the contact details you provided during checkout.",
      },
    ],

    delivery: [
      {
        q: "How much is the delivery charge?",
        a: `Orders above ₹${freeShippingAbove} may qualify for free shipping. For other orders, the standard shipping fee is ₹${shippingFee}. The final amount will be shown at checkout.`,
      },
      {
        q: "How long does delivery take?",
        a: "Delivery time depends on your location and courier service. Any available delivery estimate will be shown during checkout or shared through your order updates.",
      },
      {
        q: "How can I track my order?",
        a: "Once tracking information is available, use the tracking details shared with your order update. You can also contact our support team for help.",
      },
    ],

    products: [
      {
        q: "How do I choose the correct shirt size?",
        a: "Check the size chart on the product page before ordering. Compare the measurements with a shirt that fits you comfortably.",
      },
      {
        q: "Are the product colours exactly the same as shown?",
        a: "We try to display product colours as accurately as possible. However, slight differences may occur due to screen brightness and display settings.",
      },
      {
        q: "How should I care for my shirt?",
        a: "Follow the wash-care instructions on the product label. For best results, separate dark and light colours and avoid harsh detergents.",
      },
    ],

    returns: [
      {
        q: "Can I cancel my order?",
        a: "Contact our support team as early as possible if you need to cancel. Cancellation depends on the current processing and dispatch status of your order.",
      },
      {
        q: "What if I receive a damaged or incorrect product?",
        a: "Please contact us with your order details and clear photos of the issue. Our team will review it and guide you through the next steps.",
      },
      {
        q: "How do I request a return or exchange?",
        a: "Contact our support team with your order details and the reason for your request. Return or exchange eligibility will be checked according to the applicable store policy.",
      },
    ],

    other: [
      {
        q: "How can I contact customer support?",
        a: "You can reach us through the WhatsApp support option or the Contact page. Share your order number if your question is about an existing order.",
      },
      {
        q: "Can I ask about a product before ordering?",
        a: "Absolutely. Contact our team with the product name or link and your question. We will help you with the information available.",
      },
    ],
  };
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: "easeOut",
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.15 + i * 0.12, ease: "easeOut" },
  }),
};

/* floating gold particles (deterministic, no random flicker) */
const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 8) % 96}%`,
  size: 3 + ((i * 5) % 6),
  duration: 9 + ((i * 3) % 9),
  delay: -((i * 1.7) % 12),
}));

export default function NxFaq() {
  const nx = useNx() || {};

  const faqData = useMemo(
    () => makeFaqs(nx),
    [nx?.freeShippingAbove, nx?.shippingFee]
  );

  const [activeCategory, setActiveCategory] = useState("ordering");
  const [openQuestion, setOpenQuestion] = useState(0);
  const [query, setQuery] = useState("");

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  const selectedCategory = categories.find(
    (category) => category.id === activeCategory
  );

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const searchResults = useMemo(() => {
    if (!trimmedQuery) return null;
    return Object.values(faqData)
      .flat()
      .filter(
        (item) =>
          item.q.toLowerCase().includes(trimmedQuery) ||
          item.a.toLowerCase().includes(trimmedQuery)
      );
  }, [faqData, trimmedQuery]);

  const questions = searchResults || faqData[activeCategory] || [];

  const whatsappNumber = String(nx?.whatsapp || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hi Nexora Menswear, I need help with a question."
      )}`
    : "/menswear/contact";

  const changeCategory = (categoryId) => {
    setQuery("");
    setActiveCategory(categoryId);
    setOpenQuestion(0);
  };

  const handleSearch = (event) => {
    setQuery(event.target.value);
    setOpenQuestion(0);
  };

  return (
    <main className="nxf-page">
      <div className="nxf-noise" aria-hidden="true" />

      {/* SCROLL PROGRESS BAR */}
      <motion.div
        className="nxf-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      {/* HERO SECTION */}
      <section className="nxf-hero">
        {/* background image layers */}
        <div className="nxf-hero-bg" aria-hidden="true">
          <div
            className="nxf-hero-img"
            style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
          />
          <div className="nxf-hero-overlay" />
          <div className="nxf-hero-aurora" />
          <div className="nxf-hero-grid" />
        </div>

        {/* floating particles */}
        <div className="nxf-particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <motion.div
          className="nxf-hero-inner"
          initial="hidden"
          animate="visible"
        >
          <motion.div className="nxf-eyebrow" variants={heroItem} custom={0}>
            <span className="nxf-eyebrow-line" />
            NEXORA MENSWEAR
            <span className="nxf-eyebrow-line" />
          </motion.div>

          <motion.h1 variants={heroItem} custom={1}>
            GOOD QUESTIONS.
            <br />
            <span>BETTER ANSWERS.</span>
          </motion.h1>

          <motion.p variants={heroItem} custom={2}>
            Everything you need to know before your next favourite fit. Find
            quick answers about orders, payments, delivery and more.
          </motion.p>

          <motion.div className="nxf-hero-stats" variants={heroItem} custom={3}>
            {heroStats.map((stat) => (
              <div key={stat.label} className="nxf-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div className="nxf-hero-bottom" variants={heroItem} custom={4}>
            <span>HELP CENTRE</span>
            <span className="nxf-hero-dot" />
            <span>WE ARE HERE TO HELP</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="nxf-hero-decoration"
          initial={{ opacity: 0, rotate: -20, scale: 0.78 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          aria-hidden="true"
        >
          <span>NX</span>
          <div className="nxf-decoration-ring" />
        </motion.div>

        <div className="nxf-hero-index">FAQ / 2026</div>

        <motion.div
          className="nxf-hero-scroll"
          animate={{ y: [0, 7, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        >
          SCROLL TO EXPLORE <span />
        </motion.div>
      </section>

      {/* MARQUEE STRIP */}
      <div className="nxf-marquee" aria-hidden="true">
        <div className="nxf-marquee-track">
          {[0, 1].map((group) => (
            <div className="nxf-marquee-group" key={group}>
              {marqueeWords.map((word) => (
                <span key={`${group}-${word}`}>
                  {word}
                  <i>✳</i>
                </span>
              ))}
              {marqueeWords.map((word) => (
                <span key={`${group}-b-${word}`}>
                  {word}
                  <i>✳</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ CONTENT */}
      <section className="nxf-content">
        <motion.div
          className="nxf-content-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="nxf-section-kicker">THE HELP DESK</span>

            <h2>
              HOW CAN WE
              <br />
              <span>HELP YOU?</span>
            </h2>
          </div>

          <p>
            Choose a topic. Explore the answers.
            <br />
            Shopping with Nexora should feel simple.
          </p>
        </motion.div>

        {/* SEARCH */}
        <motion.div
          className="nxf-search"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
        >
          <FiSearch className="nxf-search-icon" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search your question... (delivery, size, return)"
            aria-label="Search frequently asked questions"
          />
          <AnimatePresence>
            {isSearching && (
              <motion.button
                type="button"
                className="nxf-search-clear"
                onClick={() => setQuery("")}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                aria-label="Clear search"
              >
                <FiX />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="nxf-layout">
          {/* CATEGORY SIDEBAR */}
          <motion.aside
            className="nxf-sidebar"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
          >
            <span className="nxf-sidebar-label">BROWSE TOPICS</span>

            <div className="nxf-category-list">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = !isSearching && activeCategory === category.id;

                return (
                  <motion.button
                    key={category.id}
                    type="button"
                    className={`nxf-category ${isActive ? "is-active" : ""}`}
                    onClick={() => changeCategory(category.id)}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    aria-pressed={isActive}
                  >
                    <span className="nxf-category-number">
                      {category.number}
                    </span>

                    <Icon className="nxf-category-icon" />

                    <span className="nxf-category-name">{category.label}</span>

                    <FiArrowUpRight className="nxf-category-arrow" />
                  </motion.button>
                );
              })}
            </div>

            <div className="nxf-sidebar-note">
              <span className="nxf-note-star">✳</span>

              <p>
                STILL HAVE
                <br />
                QUESTIONS?
              </p>

              <span>Talk to our team.</span>

              <Link to="/menswear/contact">
                CONTACT US <FiArrowUpRight />
              </Link>
            </div>
          </motion.aside>

          {/* QUESTIONS */}
          <div className="nxf-questions-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? "search" : activeCategory}
                className="nxf-question-panel"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 12 }}
              >
                <div className="nxf-panel-top">
                  <div>
                    <span className="nxf-panel-kicker">
                      {isSearching
                        ? "SEARCH"
                        : `TOPIC ${selectedCategory?.number}`}
                    </span>

                    <h3>
                      {isSearching ? "Search Results" : selectedCategory?.label}
                    </h3>
                  </div>

                  <span className="nxf-question-count">
                    {String(questions.length).padStart(2, "0")} QUESTIONS
                  </span>
                </div>

                <div className="nxf-accordion">
                  {questions.length === 0 && (
                    <motion.div className="nxf-empty" variants={itemVariants}>
                      <span>✳</span>
                      <p>No matching question found.</p>
                      <small>
                        Try another word, or ask our team directly.
                      </small>
                    </motion.div>
                  )}

                  {questions.map((item, index) => {
                    const isOpen = openQuestion === index;

                    return (
                      <motion.article
                        key={`${isSearching ? "s" : activeCategory}-${index}-${item.q}`}
                        className={`nxf-accordion-item ${
                          isOpen ? "is-open" : ""
                        }`}
                        variants={itemVariants}
                      >
                        <button
                          type="button"
                          className="nxf-question-button"
                          onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                          aria-expanded={isOpen}
                        >
                          <span className="nxf-question-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="nxf-question-text">{item.q}</span>

                          <span className="nxf-plus">
                            <FiPlus />
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              className="nxf-answer-wrap"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                height: {
                                  duration: 0.35,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                                opacity: {
                                  duration: 0.22,
                                },
                              }}
                            >
                              <div className="nxf-answer">
                                <span className="nxf-answer-mark">A.</span>
                                <p>{item.a}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    );
                  })}
                </div>

                <div className="nxf-panel-footer">
                  <span>CAN'T FIND YOUR ANSWER?</span>

                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    ASK OUR TEAM <FiArrowUpRight />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SUPPORT SECTION */}
      <motion.section
        className="nxf-support"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65 }}
      >
        <div className="nxf-support-glow" />
        <div className="nxf-support-glow nxf-support-glow-2" />

        <div className="nxf-support-content">
          <span className="nxf-section-kicker">PERSONAL ASSISTANCE</span>

          <h2>
            NEED A HAND?
            <br />
            <span>WE'RE ONE MESSAGE AWAY.</span>
          </h2>

          <p>
            Our team is ready to help you with your Nexora shopping experience.
          </p>
        </div>

        <motion.a
          href={whatsappUrl}
          className="nxf-support-button"
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.04, y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <FiMessageCircle />
          CHAT WITH US
          <FiArrowUpRight />
        </motion.a>
      </motion.section>
    </main>
  );
}