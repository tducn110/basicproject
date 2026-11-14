import React, { useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Navbar } from "./components/Navbar"
import { TopHeroBoardWithTOC } from "./components/TopHeroBoardWithTOC"
import { BenchmarkSection } from "./components/BenchmarkSection"
import { ProjectOverview } from "./components/ProjectOverview"
import { BoardRepresentationAndWinCheck } from "./components/BoardRepresentationAndWinCheck"
import { TransitionPvE } from "./components/TransitionPvE"
import { Week4RustEngine } from "./components/Week4RustEngine"
import { Week5Minimax } from "./components/Week5Minimax"
import { Week6AlphaBeta } from "./components/Week6AlphaBeta"
import { Week7CandidatesAndTiers } from "./components/Week7CandidatesAndTiers"
import { Week8To10AdvancedAI } from "./components/Week8To10AdvancedAI"
import { PythonVisualizer } from "./components/PythonVisualizer"
import { NegativeFindingsAndThreats } from "./components/NegativeFindingsAndThreats"
import { VerificationMatrixAndGates } from "./components/VerificationMatrixAndGates"
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

      {/* Top Hero Section: MỞ LÊN THẤY LUÔN BÀN CỜ + TABLE OF CONTENTS BÊN CẠNH */}
      <TopHeroBoardWithTOC onOpenFigure={handleOpenFigure} />

      <main className="relative z-10">
        {/* KÉO XUỐNG THẤY NGAY KẾT QUẢ THỰC NGHIỆM ĐỐI ĐẦU RUST VS TS */}
        <BenchmarkSection onOpenFigure={handleOpenFigure} />

        {/* BẮT ĐẦU NỀN TẢNG THUẬT TOÁN HỌC THUẬT */}
        {/* 1. Foundation & Rules Spec (Phase 1 & 2) */}
        <ProjectOverview />

        {/* 2. Core Algorithm: Board Representation, In-Place Apply/Undo & 4-Axis O(1) Raycasting */}
        <BoardRepresentationAndWinCheck onOpenFigure={handleOpenFigure} />

        {/* 3. The Transition: From PvP to PvE (WebAssembly & Web Worker) */}
        <TransitionPvE onOpenFigure={handleOpenFigure} />

        {/* 4. Week 4: Pattern Detection, Heuristics & 7 Mẫu Hình Thế */}
        <Week4RustEngine onOpenFigure={handleOpenFigure} />

        {/* 5. Week 5: Minimax Algorithm & Game Tree Search */}
        <Week5Minimax onOpenFigure={handleOpenFigure} />

        {/* 6. Week 6: Alpha-Beta Pruning, Move Ordering & Zobrist Hashing */}
        <Week6AlphaBeta onOpenFigure={handleOpenFigure} />

        {/* 7. Week 7: Candidate Move Generation, Tactical Recall & Six Bot Tiers */}
        <Week7CandidatesAndTiers onOpenFigure={handleOpenFigure} />

        {/* 8. Week 8-10: Move Ordering, Zobrist Hashing, Iterative Deepening & 18-Slide Blueprint */}
        <Week8To10AdvancedAI onOpenFigure={handleOpenFigure} />

        {/* 8b. Chương 5 (Mục 5.4.2 & 5.7): Bẫy Giải Thuật (Negative Findings) & Giới Hạn Nghiên Cứu */}
        <NegativeFindingsAndThreats />

        {/* 9. Python Sandbox (Pyodide In-Browser) & Visual Evidence Gallery */}
        <PythonVisualizer onOpenFigure={handleOpenFigure} />

        {/* 9b. Bảng 3.2 & Phụ Lục B: 10 Kịch Bản Kiểm Định (S01–S10) & 6 Cổng Nghiệm Thu (G1–G6) */}
        <VerificationMatrixAndGates />

        {/* 10. Roadmap, 6 Phases & Git Provenance Cards */}
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
