"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function WelcomePage() {
  useEffect(() => {
    function onScroll() {
      const header = document.getElementById("welcome-header");
      if (!header) return;
      if (window.scrollY > 50) {
        header.classList.add("bg-surface/80", "backdrop-blur-md", "shadow-sm");
      } else {
        header.classList.remove("bg-surface/80", "backdrop-blur-md", "shadow-sm");
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-on-surface">
      {/* Top Navigation Bar */}
      <header
        id="welcome-header"
        className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-margin-desktop h-16 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-sm">
            <span
              className="material-symbols-outlined text-white text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <span className="font-headline-sm text-headline-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-container to-secondary-container">
            EduCore
          </span>
        </div>
        <button className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors">
          Help
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-6 md:px-12 max-w-[1280px] mx-auto w-full relative">
        {/* Background Atmospheric Elements */}
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-secondary-container/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-1/4 -left-24 w-80 h-80 bg-on-tertiary-container/5 blur-[80px] rounded-full -z-10" />

        {/* Illustration */}
        <div
          className="w-full max-w-3xl aspect-[4/3] relative flex items-center justify-center mb-12 floating"
          style={{ animationDelay: "0.1s" }}
        >
          <img
            alt="Student with laptop illustration"
            className="w-full h-full object-contain"
            style={{ filter: "drop-shadow(0 0 15px rgba(6, 182, 212, 0.3))" }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQUaKnSAFyeaPNsSae5XNqzgYS8afNUs2bOU5N0gv1MqxzZZ2MEW5DHrbR8GIB51DnhM96rDxtLWoNU9mzoJRRwk0WPVLQ9gKaGNB-Dp8COovxXjg-J-yLeJuW-w2VwxuDahELpKyHn7i7gnK0gxyd0F2Z2uATwEBeVDGk2ChMLQv3Go7t1BeA0QbZi8o8W35GZLD132MrpF1yizYu4DZwje0xs6hfCvbf3xjZon8KmEj0B3d90dFfxA"
          />
          <div className="absolute top-[10%] left-[5%] glass-card rounded-[20px] p-4 hidden md:block">
            <span className="material-symbols-outlined text-secondary-container text-3xl">
              auto_stories
            </span>
          </div>
          <div className="absolute bottom-[20%] right-[5%] glass-card rounded-[20px] p-4 hidden md:block">
            <span className="material-symbols-outlined text-on-tertiary-container text-3xl">
              psychology
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center max-w-2xl w-full">
          <h1 className="font-headline-lg text-display text-primary tracking-tight leading-tight mb-6">
            Master Your Studies <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-container to-on-tertiary-container">
              with AI
            </span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 leading-relaxed">
            Built for UET Lahore students. Personalized study plans, instant AI
            tutoring, and seamless course management &mdash; all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="gradient-primary w-full sm:w-auto px-10 py-5 rounded-xl text-white font-headline-sm text-headline-sm flex items-center justify-center gap-2 group"
            >
              Get Started
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-5 border border-outline/30 rounded-xl font-headline-sm text-headline-sm text-on-surface hover:bg-surface-container transition-all"
            >
              Already have an account?{" "}
              <span className="font-bold text-primary">Log In</span>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24">
          <div className="glass-card rounded-[20px] p-8 flex flex-col items-start gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">smart_toy</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm">AI Assistant</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Real-time help with complex problems and concept explanations.
            </p>
          </div>
          <div className="glass-card rounded-[20px] p-8 flex flex-col items-start gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-on-tertiary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-container">timeline</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm">Study Tracks</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Guided learning paths tailored to your academic goals and pace.
            </p>
          </div>
          <div className="glass-card rounded-[20px] p-8 flex flex-col items-start gap-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-container">groups</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm">Peer Groups</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Connect with classmates studying the same courses.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center text-on-surface-variant/60 font-label-md text-label-md border-t border-outline/10">
        © 2026 EduCore &middot; UET Lahore
      </footer>
    </div>
  );
}
