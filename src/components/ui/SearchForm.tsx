'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { capitalize } from '@/utils/capitalize';
import { getCategoryTags } from '@/data/category';
import { toastError } from '@/lib/toast';
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';
import { HiOutlineEmojiSad } from 'react-icons/hi';
import { ImSpinner8 } from 'react-icons/im';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useSearchFormStore } from '@/stores/useSearchFormStore';

export default function SearchForm() {
  const { input, setInput, categoryTags, setCategoryTags } =
    useSearchFormStore();

  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    if (input) {
      setLoading(true);
      timeoutRef.current = setTimeout(() => {
        (async () => {
          try {
            const data = await getCategoryTags(input);
            setCategoryTags(data);
            setShowMenu(true);
          } catch (err) {
            toastError(err);
          } finally {
            setLoading(false);
          }
        })();
      }, 500);
    } else {
      setCategoryTags([]);
      setLoading(false);
      setShowMenu(false);
    }
  }, [input, setCategoryTags]);

  const handleSearchClick = async () => {
    if (input) {
      setLoading(true);
      try {
        const data = await getCategoryTags(input);
        setCategoryTags(data);
        setShowMenu(true);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    } else {
      setCategoryTags([]);
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleFocus = () => {
    if (input && !isLoading) {
      setShowMenu(true);
    }
  };

  const ref = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

  return (
    <div
      ref={ref}
      className="max-w-72 relative hidden flex-1 font-sans font-normal text-slate-700 md:block"
    >
      <section className="group flex items-center rounded-full border border-transparent bg-slate-50 py-2 pl-4 shadow-inner shadow-slate-300 outline-none focus-within:border-cyan-500">
        <input
          type="text"
          className="w-full resize-none bg-transparent"
          placeholder="Search"
          onChange={(e) => setInput(e.target.value.trim())}
          onFocus={handleFocus}
          value={input}
        />
        <button
          onClick={handleSearchClick}
          type="button"
          className="pl-2 pr-3 text-cyan-700 transition group-focus-within:text-cyan-500"
        >
          {isLoading ? (
            <ImSpinner8 className="animate-spin" />
          ) : (
            <HiMiniMagnifyingGlass className="text-xl" />
          )}
        </button>
      </section>
      {showMenu && (
        <div className="absolute top-12 w-full rounded-b-lg border-t border-slate-100 bg-slate-50 px-3 py-2 shadow-md">
          {categoryTags.length === 0 ? (
            <p className="flex items-center justify-center gap-1 text-sm text-slate-500">
              Nothing found <HiOutlineEmojiSad className="text-base" />
            </p>
          ) : (
            <ul>
              {categoryTags.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/items?categoryId=${category.id}`}
                    className="transition hover:text-cyan-500 focus:text-cyan-500"
                  >
                    {capitalize(category.title)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
