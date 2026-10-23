import React, { useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Navbar } from "./components/Navbar"
import { HeroSection } from "./components/HeroSection"
import { ProjectOverview } from "./components/ProjectOverview"
import { Week3Decoupling } from "./components/Week3Decoupling"
import { TransitionPvE } from "./components/TransitionPvE"
import { Week4RustEngine } from "./components/Week4RustEngine"
import { Week5Minimax } from "./components/Week5Minimax"
import { Week6AlphaBeta } from "./components/Week6AlphaBeta"
import { Week7CandidatesAndTiers } from "./components/Week7CandidatesAndTiers"
import { Week8To10AdvancedAI } from "./components/Week8To10AdvancedAI"
import { PythonVisualizer } from "./components/PythonVisualizer"
import { InteractiveCaroBoard } from "./components/InteractiveCaroBoard"
import { BenchmarkSection } from "./components/BenchmarkSection"
import { RoadmapSection } from "./components/RoadmapSection"
import { Footer } from "./components/Footer"
import { FigureInspectorModal } from "./components/FigureInspectorModal"
import { FIGURE_REGISTRY } from "./utils/figureRegistry"
import { soundManager } from "./utils/audio"

gsap.registerPlugin(ScrollTrigger)

export function App() {
  const [activeFigureId, setActiveFigureId] = useState<string | null>(null)

  const handleOpenFigure = (id: string) => {
    soundManager.playClick()
    setActiveFigureId(id)
  }

  const handleCloseFigure = () => {
    setActiveFigureId(null)
  }

  const currentFigure = activeFigureId ? FIGURE_REGISTRY[activeFigureId] || null : null

  useEffect(() => {
    const sections = document.querySelectorAll("section")
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0.9, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      )
    })
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#202020] font-sans relative selection:bg-[#6647f0]/20 selection:text-[#090c1d]">
      {/* Unified Sticky Header with Milestone Dropdown, Reading Progress & Chapter Spy */}
      <Navbar />

      {/* Hero Section with ClickUp Style, Conic CTA, Benefits */}
      <HeroSection onOpenFigure={handleOpenFigure} />

      <main className="relative z-10">
        {/* Foundation & Rules Spec (Phase 1 & 2) */}
        <ProjectOverview />

        {/* Week 3: UI Architecture Decoupling & State Invariants */}
        <Week3Decoupling onOpenFigure={handleOpenFigure} />

        {/* The Transition: From PvP to PvE (WebAssembly & Web Worker) */}
        <TransitionPvE onOpenFigure={handleOpenFigure} />

        {/* Week 4: Pattern Detection, Heuristics & Rust Engine */}
        <Week4RustEngine onOpenFigure={handleOpenFigure} />

        {/* Week 5: Minimax Algorithm & Game Tree Search */}
        <Week5Minimax onOpenFigure={handleOpenFigure} />

        {/* Week 6: Alpha-Beta Pruning, Move Ordering & Zobrist Hashing */}
        <Week6AlphaBeta onOpenFigure={handleOpenFigure} />

        {/* Week 7: Candidate Move Generation, Tactical Recall & Six Bot Tiers */}
        <Week7CandidatesAndTiers onOpenFigure={handleOpenFigure} />

        {/* Week 8-10: Move Ordering, Zobrist Hashing, Iterative Deepening & 18-Slide Blueprint */}
        <Week8To10AdvancedAI onOpenFigure={handleOpenFigure} />

        {/* Python Sandbox (Pyodide In-Browser) & Visual Evidence Gallery */}
        <PythonVisualizer onOpenFigure={handleOpenFigure} />

        {/* Live Playable Interactive 15x15 Caro Board */}
        <InteractiveCaroBoard onOpenFigure={handleOpenFigure} />

        {/* Rust vs TypeScript Empirical Benchmarks */}
        <BenchmarkSection onOpenFigure={handleOpenFigure} />

        {/* Roadmap, 6 Phases & Git Provenance Cards */}
        <RoadmapSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Deep Figure Inspector Modal (Opened on touching ANY picture) */}
      <FigureInspectorModal
        figure={currentFigure}
        onClose={handleCloseFigure}
      />
    </div>
  )
}

export default App
