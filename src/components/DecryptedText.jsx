// src/DecryptedText.jsx
import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

const styles = {
  wrapper: { display: 'inline-block', whiteSpace: 'pre-wrap' },
  srOnly: {
    position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
    overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0,
  },
};

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let interval;
    let currentIteration = 0;

    const getNextIndex = (revealedSet) => {
      const len = text.length;
      switch (revealDirection) {
        case 'start': return revealedSet.size;
        case 'end':   return len - 1 - revealedSet.size;
        case 'center': {
          const mid = Math.floor(len / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const next =
            revealedSet.size % 2 === 0 ? mid + offset : mid - offset - 1;
          if (next >= 0 && next < len && !revealedSet.has(next)) return next;
          for (let i = 0; i < len; i++) if (!revealedSet.has(i)) return i;
          return 0;
        }
        default: return revealedSet.size;
      }
    };

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter((c) => c !== ' ')
      : characters.split('');

    const shuffleText = (original, currentRevealed) => {
      if (useOriginalCharsOnly) {
        const positions = original.split('').map((char, i) => ({
          char, isSpace: char === ' ', index: i, isRevealed: currentRevealed.has(i),
        }));
        const pool = positions.filter(p => !p.isSpace && !p.isRevealed).map(p => p.char);
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        let k = 0;
        return positions.map(p => p.isSpace ? ' ' : (p.isRevealed ? original[p.index] : pool[k++])).join('');
      }
      return original.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (currentRevealed.has(i)) return original[i];
        return availableChars[Math.floor(Math.random() * availableChars.length)];
      }).join('');
    };

    if (isHovering) {
      setIsScrambling(true);
      interval = setInterval(() => {
        setRevealedIndices((prev) => {
          if (sequential) {
            if (prev.size < text.length) {
              const idx = getNextIndex(prev);
              const next = new Set(prev); next.add(idx);
              setDisplayText(shuffleText(text, next));
              return next;
            } else {
              clearInterval(interval); setIsScrambling(false);
              return prev;
            }
          } else {
            setDisplayText(shuffleText(text, prev));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(interval); setIsScrambling(false); setDisplayText(text);
            }
            return prev;
          }
        });
      }, speed);
    } else {
      setDisplayText(text); setRevealedIndices(new Set()); setIsScrambling(false);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [isHovering, text, speed, maxIterations, sequential, revealDirection, characters, useOriginalCharsOnly]);

  useEffect(() => {
    if (animateOn !== 'view') return;
    const cb = (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !hasAnimated) {
          setIsHovering(true); setHasAnimated(true);
        }
      });
    };
    const obs = new IntersectionObserver(cb, { threshold: 0.1 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { if (containerRef.current) obs.unobserve(containerRef.current); };
  }, [animateOn, hasAnimated]);

  const hoverProps = animateOn === 'hover'
    ? { onMouseEnter: () => setIsHovering(true), onMouseLeave: () => setIsHovering(false) }
    : {};

  return (
    <motion.span
      className={parentClassName}
      ref={containerRef}
      style={styles.wrapper}
      {...hoverProps}
      {...props}
    >
      <span style={styles.srOnly}>{displayText}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, i) => {
          const revealed = revealedIndices.has(i) || !isScrambling || !isHovering;
          return (
            <span key={i} className={revealed ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
