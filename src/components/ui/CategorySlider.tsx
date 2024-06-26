'use client';

import Link from 'next/link';
import { CategoryTagDto } from '@/shared/dtos/category.dto';
import { capitalize } from '@/utils/capitalize';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useEffect, useRef, useState } from 'react';

interface Props {
  categories: CategoryTagDto[];
  skip?: number;
}

// This could've been done "easier" or more optimized just by using CSS animations I guess
export default function CategorySlider({ categories, skip }: Props) {
  const [autoplay, setAutoplay] = useState(true);

  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLUListElement>(null);

  const xRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const sliderContainer = sliderContainerRef.current;
    const slider = sliderRef.current;

    if (autoplay && sliderContainer && slider) {
      const rightBoundary = slider.clientWidth - sliderContainer.clientWidth;

      const slideToX = () => {
        const x = xRef.current;

        if (x < rightBoundary) {
          slider.style.transform = `translateX(-${x}px)`;
          xRef.current += 0.3;
        } else {
          const gapSize = 8; // gap-2
          const xSnapBackPosition =
            x / 2 - sliderContainer.clientWidth / 2 - gapSize / 2;

          slider.style.transform = `translateX(-${xSnapBackPosition}px)`;
          xRef.current = xSnapBackPosition;
        }

        animationFrameRef.current = requestAnimationFrame(slideToX);
      };

      animationFrameRef.current = requestAnimationFrame(slideToX);
    }

    return () => {
      const animationFrameId = animationFrameRef.current;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [autoplay]);

  const handleSlideLeftClick = () => {
    const sliderContainer = sliderContainerRef.current;
    const slider = sliderRef.current;

    if (sliderContainer && slider) {
      const newPosition = Math.max(
        xRef.current - sliderContainer.clientWidth,
        0,
      );

      slider.style.transform = `translateX(-${newPosition}px)`;
      xRef.current = newPosition;
    }
  };

  const handleSlideRightClick = () => {
    const sliderContainer = sliderContainerRef.current;
    const slider = sliderRef.current;

    if (sliderContainer && slider) {
      const rightBoundary = slider.clientWidth - sliderContainer.clientWidth;

      const newPosition = Math.min(
        xRef.current + sliderContainer.clientWidth,
        rightBoundary,
      );

      slider.style.transform = `translateX(-${newPosition}px)`;
      xRef.current = newPosition;
    }
  };

  const timeoutId = useRef<NodeJS.Timeout>();

  const handleMouseEnterSliderContainer = () => {
    clearTimeout(timeoutId.current);
    setAutoplay(false);
  };

  const handleMouseLeaveSliderContainer = () => {
    timeoutId.current = setTimeout(() => setAutoplay(true), 2500);
  };

  const touchTimeoutId = useRef<NodeJS.Timeout>();

  const handleTouchStartSliderContainer = () => {
    clearTimeout(touchTimeoutId.current);
    setAutoplay(false);
  };

  const handleTouchEndSliderContainer = () => {
    touchTimeoutId.current = setTimeout(() => setAutoplay(true), 3500);
  };

  return (
    <section
      className="flex w-full items-center gap-2"
      onMouseEnter={handleMouseEnterSliderContainer}
      onMouseLeave={handleMouseLeaveSliderContainer}
      onTouchStart={handleTouchStartSliderContainer}
      onTouchEnd={handleTouchEndSliderContainer}
    >
      <button
        type="button"
        onClick={handleSlideLeftClick}
        className="rounded-full bg-white p-1.5 text-sm text-slate-700 shadow-md transition hover:text-cyan-700 md:p-2 md:text-base"
      >
        <HiChevronLeft />
      </button>
      <div
        className="overflow-hidden rounded-full py-2 md:py-5"
        ref={sliderContainerRef}
      >
        <ul
          ref={sliderRef}
          className={`flex w-max gap-2 ${autoplay ? '' : 'transition-transform duration-1000'}`}
        >
          {categories.map(
            (category) =>
              category.id !== skip && (
                <li key={category.id}>
                  <Link
                    href={`/items?categoryId=${category.id}`}
                    className="text-nowrap rounded-full bg-white px-2 py-1.5 text-sm text-slate-500 shadow-md transition hover:text-cyan-500 focus:text-cyan-500 md:text-base"
                  >
                    {capitalize(category.title)}
                  </Link>
                </li>
              ),
          )}
          {categories.map(
            (category) =>
              category.id !== skip && (
                <li key={`${category.id}-duplicate`} aria-hidden={true}>
                  <Link
                    href={`/items?categoryId=${category.id}`}
                    className="text-nowrap rounded-full bg-white px-2 py-1.5 text-sm text-slate-500 shadow-md transition hover:text-cyan-500 focus:text-cyan-500 md:text-base"
                  >
                    {capitalize(category.title)}
                  </Link>
                </li>
              ),
          )}
        </ul>
      </div>
      <button
        type="button"
        onClick={handleSlideRightClick}
        className="rounded-full bg-white p-1.5 text-sm text-slate-700 shadow-md transition hover:text-cyan-700 md:p-2 md:text-base"
      >
        <HiChevronRight />
      </button>
    </section>
  );
}
