'use client'
// components/shared/ArticleLoadingModal.tsx
import { useEffect, useState } from 'react'

const QUOTES = [
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
  { text: "It is not that I'm so smart, but I stay with the questions much longer.", author: "Albert Einstein" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Learning without thought is labor lost; thought without learning is perilous.", author: "Confucius" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "No man was ever wise by chance.", author: "Seneca" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "It is impossible for a man to learn what he thinks he already knows.", author: "Epictetus" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { text: "Science is a way of thinking much more than it is a body of knowledge.", author: "Carl Sagan" },
  { text: "The mind once stretched by a new idea never returns to its original dimensions.", author: "Oliver Wendell Holmes Sr." },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein" },
  { text: "Logic will get you from A to Z; imagination will get you everywhere.", author: "Albert Einstein" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Knowledge is the food of the soul.", author: "Plato" },
  { text: "I think, therefore I am.", author: "René Descartes" },
  { text: "Doubt is the origin of wisdom.", author: "René Descartes" },
  { text: "If I have seen further, it is by standing on the shoulders of giants.", author: "Isaac Newton" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
  { text: "All our knowledge begins with the senses, proceeds then to the understanding, and ends with reason.", author: "Immanuel Kant" },
  { text: "Judge a man by his questions rather than by his answers.", author: "Voltaire" },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { text: "Unless you try to do something beyond what you have already mastered, you will never grow.", author: "Ralph Waldo Emerson" },
  { text: "The greatest discovery of my generation is that a human being can alter his life by altering his attitudes.", author: "William James" },
  { text: "The good life is one inspired by love and guided by knowledge.", author: "Bertrand Russell" },
  { text: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan" },
  { text: "The greatest enemy of knowledge is not ignorance; it is the illusion of knowledge.", author: "Stephen Hawking" },
  { text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.", author: "Richard Feynman" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "The more you know, the more you realize you don't know.", author: "Aristotle" },
  { text: "I am always ready to learn although I do not always like being taught.", author: "Winston Churchill" },
  { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
  { text: "Anyone who stops learning is old, whether at twenty or eighty.", author: "Henry Ford" },
  { text: "Wonder is the beginning of wisdom.", author: "Socrates" },
  { text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "The function of education is to teach one to think intensively and to think critically.", author: "Martin Luther King Jr." },
  { text: "Intellectual growth should commence at birth and cease only at death.", author: "Albert Einstein" },
  { text: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
  { text: "Learning is an ornament in prosperity, a refuge in adversity, and a provision in old age.", author: "Aristotle" },
  { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
  { text: "As long as you live, keep learning how to live.", author: "Seneca" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
  { text: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
  { text: "Seek not the good in external things; seek it in yourself.", author: "Epictetus" },
  { text: "All of humanity's problems stem from man's inability to sit quietly in a room alone.", author: "Blaise Pascal" },
  { text: "A wise man proportions his belief to the evidence.", author: "David Hume" },
  { text: "That which does not kill us, makes us stronger.", author: "Friedrich Nietzsche" },
  { text: "Talent hits a target no one else can hit; Genius hits a target no one else can see.", author: "Arthur Schopenhauer" },
  { text: "Two things fill the mind with ever-increasing wonder: the starry sky above me and the moral law within me.", author: "Immanuel Kant" },
  { text: "The more I read, the more I learn how little I know.", author: "Voltaire" },
  { text: "Those who cannot remember the past are condemned to repeat it.", author: "George Santayana" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "The aim of education is to enable individuals to continue their education.", author: "John Dewey" },
  { text: "The cosmos is within us. We are made of star-stuff.", author: "Carl Sagan" },
  { text: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author: "Richard Feynman" },
  { text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.", author: "Alan Turing" },
  { text: "It is not the strongest of the species that survives, but the one most responsive to change.", author: "Charles Darwin" },
  { text: "Be less curious about people and more curious about ideas.", author: "Marie Curie" },
  { text: "You cannot teach a man anything; you can only help him to discover it in himself.", author: "Galileo Galilei" },
  { text: "Reading maketh a full man; conference a ready man; and writing an exact man.", author: "Francis Bacon" },
  { text: "Life can only be understood backwards; but it must be lived forwards.", author: "Søren Kierkegaard" },
  { text: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { text: "Opportunities multiply as they are seized.", author: "Sun Tzu" },
  { text: "Knowing others is wisdom; knowing yourself is enlightenment.", author: "Lao Tzu" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "By three methods we may learn wisdom: reflection, imitation, and experience.", author: "Confucius" },
  { text: "The beginning is the most important part of the work.", author: "Plato" },
  { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
  { text: "No man ever steps in the same river twice, for it is not the same river and he is not the same man.", author: "Heraclitus" },
  { text: "There are in fact two things, science and opinion; the former begets knowledge, the latter ignorance.", author: "Hippocrates" },
  { text: "The secret to happiness is freedom and the secret to freedom is courage.", author: "Thucydides" },
  { text: "Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.", author: "Marcus Aurelius" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "Education is the kindling of a flame, not the filling of a vessel.", author: "Socrates" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "To know what you know and what you do not know — that is true knowledge.", author: "Confucius" },
  { text: "I cannot teach anybody anything; I can only make them think.", author: "Socrates" },
  { text: "An ounce of practice is worth more than tons of preaching.", author: "Mahatma Gandhi" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "The only source of knowledge is experience.", author: "Albert Einstein" },
  { text: "Curiosity is the engine of achievement.", author: "Ken Robinson" },
  { text: "Minds are like parachutes — they only function when open.", author: "Thomas Dewar" },
  { text: "The wisest are the most annoyed at the loss of time.", author: "Dante Alighieri" },
  { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats" },
  { text: "The beautiful souls are they that are universal, open, and ready for all things.", author: "Michel de Montaigne" },
  { text: "The impeded stream is the one that sings.", author: "Wendell Berry" },
  { text: "In seeking wisdom thou art wise; in imagining thou hast attained it, thou art a fool.", author: "Rabbi Ben Azai" },
  { text: "The present is theirs; the future, for which I really worked, is mine.", author: "Nikola Tesla" },
]

interface Props {
  completing: boolean
}

export default function ArticleLoadingModal({ completing }: Props) {
  const [quoteVisible, setQuoteVisible] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [mounted, setMounted] = useState(false)
  const [barWidth, setBarWidth] = useState('0%')
  const [barTransition, setBarTransition] = useState('none')

  // Fade-in on mount
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setMounted(true)
        setQuoteVisible(true)
      })
      return () => cancelAnimationFrame(raf2)
    })
    return () => cancelAnimationFrame(raf1)
  }, [])

  // Progress bar: 0 → 85% over 2.5s on mount
  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setBarTransition('width 2500ms cubic-bezier(0.05, 0.5, 0.15, 1.0)')
        setBarWidth('85%')
      })
      return () => cancelAnimationFrame(raf2)
    })
    return () => cancelAnimationFrame(raf1)
  }, [])

  // Progress bar: jump to 100% when completing
  useEffect(() => {
    if (!completing) return
    setBarTransition('width 380ms ease-in-out')
    setBarWidth('100%')
  }, [completing])

  // Cycle quotes every 3 seconds
  useEffect(() => {
    if (completing) return
    let fadeTimer: ReturnType<typeof setTimeout> | null = null
    const interval = setInterval(() => {
      setQuoteVisible(false)
      if (fadeTimer) clearTimeout(fadeTimer)
      fadeTimer = setTimeout(() => {
        setQuoteIdx((prev) => {
          let next
          do { next = Math.floor(Math.random() * QUOTES.length) } while (next === prev)
          return next
        })
        setQuoteVisible(true)
      }, 420)
    }, 3200)
    return () => {
      clearInterval(interval)
      if (fadeTimer) clearTimeout(fadeTimer)
    }
  }, [completing])

  const quote = QUOTES[quoteIdx]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        opacity: completing ? 0 : (mounted ? 1 : 0),
        transition: completing ? 'opacity 700ms ease-out' : 'opacity 350ms ease-out',
      }}
    >
      {/* Gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-18%', right: '-10%',
          width: '60%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.10) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-18%', left: '-10%',
          width: '60%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(59,130,246,0.10) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', left: '15%',
          width: '35%', height: '35%', borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(245,158,11,0.07) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', right: '10%',
          width: '28%', height: '28%', borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(16,185,129,0.06) 0%, transparent 65%)',
        }} />
      </div>

      {/* Brand mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 44, position: 'relative' }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
        }} />
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        }} />
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.20em',
          textTransform: 'uppercase' as const,
          color: '#C4C9D4',
          margin: '0 4px',
        }}>
          Applied Agentic AI
        </span>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        }} />
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
        }} />
      </div>

      {/* Quote area */}
      <div style={{
        width: '100%',
        maxWidth: 600,
        padding: '0 36px',
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Decorative thin top/bottom lines flanking the quote box */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 48, height: 2,
          background: 'linear-gradient(90deg, transparent, #E5E7EB, transparent)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 48, height: 2,
          background: 'linear-gradient(90deg, transparent, #E5E7EB, transparent)',
        }} />

        <div style={{
          opacity: quoteVisible ? 1 : 0,
          transform: quoteVisible ? 'translateY(0px)' : 'translateY(10px)',
          transition: 'opacity 420ms ease-in-out, transform 420ms ease-in-out',
          padding: '24px 0',
        }}>
          {/* Decorative quotation mark */}
          <div style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: '5.5rem',
            lineHeight: 0.75,
            color: '#EEF0F3',
            userSelect: 'none' as const,
            marginBottom: 20,
            display: 'block',
            letterSpacing: '-0.02em',
          }}>
            ❝
          </div>

          {/* Quote text */}
          <p style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: 'clamp(1.05rem, 2.2vw, 1.38rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.80,
            color: '#1F2937',
            marginBottom: 28,
            letterSpacing: '0.01em',
          }}>
            {quote.text}
          </p>

          {/* Attribution */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{
              height: 1, width: 28,
              background: 'linear-gradient(90deg, transparent, #D1D5DB)',
            }} />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.80rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: '#9CA3AF',
            }}>
              {quote.author}
            </p>
            <div style={{
              height: 1, width: 28,
              background: 'linear-gradient(90deg, #D1D5DB, transparent)',
            }} />
          </div>
        </div>
      </div>

      {/* Animated loading dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 44 }}>
        {[
          'linear-gradient(135deg, #f59e0b, #ef4444)',
          'linear-gradient(135deg, #ec4899, #8b5cf6)',
          'linear-gradient(135deg, #3b82f6, #10b981)',
        ].map((bg, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: bg,
              animation: `aa-dot-pulse 1.6s ease-in-out ${i * 0.22}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Loading label */}
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.70rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        color: '#D1D5DB',
        marginTop: 14,
      }}>
        Preparing your article
      </p>

      {/* Progress bar track */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: barWidth,
          transition: barTransition,
          background: 'linear-gradient(90deg, #f59e0b, #ef4444, #ec4899, #8b5cf6, #3b82f6, #10b981, #f59e0b)',
          backgroundSize: '300% 100%',
          animation: 'aa-grad-shift 4s linear infinite',
        }} />
      </div>
    </div>
  )
}
