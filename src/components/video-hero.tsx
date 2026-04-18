"use client";

import Link from "next/link";

export default function VideoHero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Fullscreen looping background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          type="video/mp4"
        />
      </video>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px] min-h-screen">
        <h1
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-white animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          You bring the{" "}
          <em className="not-italic text-white/50">vision.</em>
          <br />
          We build{" "}
          <em className="not-italic text-white/50">everything else.</em>
        </h1>

        <p className="text-white/50 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          Focus on what matters — your ideas, your brand, your story.
          We handle the design, the code, and the details so your digital
          presence feels effortless.
        </p>

        <Link
          href="/create-site"
          className="liquid-glass rounded-full px-14 py-5 text-base text-white mt-12 hover:scale-[1.03] cursor-pointer transition-transform animate-fade-rise-delay-2"
        >
          Create a site
        </Link>
      </div>
    </section>
  );
}
