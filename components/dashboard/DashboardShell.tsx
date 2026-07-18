"use client";

import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

/** Outer chrome: centered surface, floating sidebar, header, and a 4-column
 *  content grid that the dashboard rows (E5–E8) slot into. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg p-4 pb-28 md:p-6 md:pb-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-[1700px]"
      >
        <Header />
        <div className="mt-6 flex gap-6">
          <Sidebar />
          <div className="grid flex-1 auto-rows-min grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {children}
          </div>
        </div>
      </motion.div>

      {/* Sticky bottom nav on phones */}
      <MobileNav />
    </div>
  );
}
