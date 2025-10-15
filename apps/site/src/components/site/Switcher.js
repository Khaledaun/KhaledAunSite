'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { animateScroll as scroll } from 'react-scroll';
import * as Unicons from '@iconscout/react-unicons'

export default function Switcher() {
  const [scrollToTops, setScrollToTops] = useState(false); 

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () => {
        setScrollToTops(window.scrollY >= 500)
      });
    }
  }, [])

  const scrollToTop = () => {
    scroll.scrollToTop({
      duration: 500,
      smooth: true,
    });
  }

  function changeMode(mode) {
    switch (mode) {
      case 'mode':
        if (document.documentElement.className.includes("dark")) {
          document.documentElement.className = document.documentElement.className.replace('dark', '').trim();
        } else {
          document.documentElement.className = document.documentElement.className + ' dark';
        }
        break;
      default:
        break;
    }
  }

  return (
    <>
      {/* Dark/Light Mode Toggle */}
      <div className="fixed top-1/4 -right-3 z-50">
        <span className="relative inline-block rotate-90">
          <input 
            type="checkbox" 
            className="checkbox opacity-0 absolute" 
            id="chk" 
            onClick={() => changeMode('mode')} 
          />
          <label 
            className="label bg-slate-900 dark:bg-white shadow dark:shadow-gray-800 cursor-pointer rounded-full flex justify-between items-center p-1 w-14 h-8" 
            htmlFor="chk"
          >
            <Unicons.UilMoon width={18} className="text-[20px] text-yellow-500" />
            <Unicons.UilSun width={18} className="text-[20px] text-yellow-500" />
            <span className="ball bg-white dark:bg-slate-900 rounded-full absolute top-[2px] left-[2px] w-7 h-7"></span>
          </label>
        </span>
      </div>

      {/* Back to Top Button */}
      <Link 
        href="#" 
        onClick={scrollToTop}
        id="back-to-top" 
        className={`${!scrollToTops ? "hidden" : "back-to-top fixed text-lg rounded-full z-10 bottom-5 right-5 h-9 w-9 text-center bg-brand-gold text-white leading-9 flex items-center justify-center hover:bg-brand-gold/90 transition-all duration-300"}`}
      >
        <Unicons.UilArrowUp width={18} />
      </Link>
    </>
  )
}

