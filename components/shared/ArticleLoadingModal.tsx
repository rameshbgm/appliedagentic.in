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
  { text: "To be conscious that you are ignorant is a great step to knowledge.", author: "Benjamin Disraeli" },
  { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "The purpose of education is to replace an empty mind with an open one.", author: "Malcolm Forbes" },
  { text: "We learn more by looking for the answer to a question than we do from the answer itself.", author: "Lloyd Alexander" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { text: "An educated mind is, as it were, composed of all the minds of preceding ages.", author: "Bernard Le Bovier de Fontenelle" },
  { text: "Educated men are as much superior to uneducated men as the living are to the dead.", author: "Aristotle" },
  { text: "Ignorance is the curse of God; knowledge is the wing wherewith we fly to heaven.", author: "William Shakespeare" },
  { text: "Information is not knowledge.", author: "Albert Einstein" },
  { text: "The noblest pleasure is the joy of understanding.", author: "Leonardo da Vinci" },
  { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "He who learns but does not think is lost. He who thinks but does not learn is in great danger.", author: "Confucius" },
  { text: "To learn to read is to light a fire.", author: "Victor Hugo" },
  { text: "Change is the end result of all true learning.", author: "Leo Buscaglia" },
  { text: "The whole purpose of education is to turn mirrors into windows.", author: "Sydney J. Harris" },
  { text: "In learning you will teach, and in teaching you will learn.", author: "Phil Collins" },
  { text: "Study without desire spoils the memory, and it retains nothing that it takes in.", author: "Leonardo da Vinci" },
  { text: "A little learning is a dangerous thing; drink deep, or taste not the Pierian spring.", author: "Alexander Pope" },
  { text: "What sculpture is to a block of marble, education is to a human soul.", author: "Joseph Addison" },
  { text: "The difference between school and life? In school, you are taught a lesson and then given a test. In life, you are given a test that teaches you a lesson.", author: "Tom Bodett" },
  { text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.", author: "Albert Einstein" },
  { text: "Knowledge is knowing that a tomato is a fruit. Wisdom is not putting it in a fruit salad.", author: "Miles Kington" },
  { text: "Without knowledge, action is useless, and knowledge without action is futile.", author: "Abu Bakr" },
  { text: "Research is to see what everybody else has seen, and to think what nobody else has thought.", author: "Albert Szent-Györgyi" },
  { text: "The job of education is not to fill a bucket but to light a fire.", author: "William Butler Yeats" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "Curiosity is one of the great secrets of happiness.", author: "Bryant H. McGill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Every child is an artist. The problem is how to remain an artist once we grow up.", author: "Pablo Picasso" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "The secret of genius is to carry the spirit of the child into old age, which means never losing your enthusiasm.", author: "Aldous Huxley" },
  { text: "Logic is the beginning of wisdom, not the end.", author: "Leonard Nimoy" },
  { text: "Wonder is not a disease. Wonder — and its expression in poetry and music — is an antidote to the narrowness of life.", author: "Lewis Thomas" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "The function of a computer is to compute the obvious.", author: "Ted Nelson" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "Technology is neither good nor bad; nor is it neutral.", author: "Melvin Kranzberg" },
  { text: "The internet is becoming the town square for the global village of tomorrow.", author: "Bill Gates" },
  { text: "We're still in the first minutes of the first day of the internet revolution.", author: "Scott Cook" },
  { text: "Intelligence is the ability to adapt to change.", author: "Stephen Hawking" },
  { text: "The danger of the past was that men became slaves. The danger of the future is that men may become robots.", author: "Erich Fromm" },
  { text: "The real question is not whether machines can think but whether men do.", author: "B.F. Skinner" },
  { text: "A year from now you will wish you had started today.", author: "Karen Lamb" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The secret of getting things done is to act.", author: "Dante Alighieri" },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
  { text: "Even if you're on the right track, you'll get run over if you just sit there.", author: "Will Rogers" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
  { text: "Whatever the mind of man can conceive and believe, it can achieve.", author: "Napoleon Hill" },
  { text: "The wisest mind has something yet to learn.", author: "George Santayana" },
  { text: "He that knows little often repeats it.", author: "Thomas Fuller" },
  { text: "There is no wealth like knowledge, no poverty like ignorance.", author: "Ali ibn Abi Talib" },
  { text: "Knowledge speaks, but wisdom listens.", author: "Jimi Hendrix" },
  { text: "The most courageous act is still to think for yourself. Aloud.", author: "Coco Chanel" },
  { text: "Be a lifelong student. The more you learn, the more you earn and the more self-confidence you will have.", author: "Brian Tracy" },
  { text: "Determination gives you the resolve to keep going in spite of the roadblocks.", author: "Denis Waitley" },
  { text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss" },
  { text: "I've missed more than 9,000 shots in my career. That's why I succeed.", author: "Michael Jordan" },
  { text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford" },
  { text: "The man who does not read has no advantage over the man who cannot read.", author: "Mark Twain" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "One must always be aware, to notice — even though the cost of noticing is to become responsible.", author: "Thylias Moss" },
  { text: "The person who reads too much and uses his brain too little will fall into lazy habits of thinking.", author: "Albert Einstein" },
  { text: "Not what we know, but what we don't know is what counts.", author: "Oscar Wilde" },
  { text: "Science is an imaginative adventure of the mind seeking truth in a world of mystery.", author: "Cyril Herman Hinshelwood" },
  { text: "Scientific progress is measured in units of courage.", author: "Paul Dirac" },
  { text: "In science, there are no shortcuts to truth.", author: "Karl Popper" },
  { text: "The scientist is not a person who gives the right answers; he's one who asks the right questions.", author: "Claude Lévi-Strauss" },
  { text: "Science is the great antidote to the poison of enthusiasm and superstition.", author: "Adam Smith" },
  { text: "An expert is a man who has made all the mistakes which can be made, in a narrow field.", author: "Niels Bohr" },
  { text: "The strength of a theory lies in its falsifiability.", author: "Karl Popper" },
  { text: "Everything should be made as simple as possible, but not simpler.", author: "Albert Einstein" },
  { text: "The whole of science is nothing more than a refinement of everyday thinking.", author: "Albert Einstein" },
  { text: "Nature uses as little as possible of anything.", author: "Johannes Kepler" },
  { text: "Not knowing is not the problem. Not wanting to know is.", author: "Stephen Covey" },
  { text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", author: "Marcel Proust" },
  { text: "Enlightenment is man's emergence from his self-imposed immaturity.", author: "Immanuel Kant" },
  { text: "All human beings, by nature, desire to know.", author: "Aristotle" },
  { text: "Wonder is the desire for knowledge.", author: "Thomas Aquinas" },
  { text: "Reason is the natural order of truth; but imagination is the organ of meaning.", author: "C.S. Lewis" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Pursue what catches your heart, not what catches your eyes.", author: "Roy T. Bennett" },
  { text: "Integrity is choosing courage over comfort; choosing what is right over what is fun, fast, or easy.", author: "Brené Brown" },
  { text: "The obstacle is not the path, the obstacle is the path.", author: "Zen Proverb" },
  { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
  { text: "You will never be able to escape from your heart. So it is better to listen to what it has to say.", author: "Paulo Coelho" },
  { text: "Education enables people to ask better questions, not just answer the ones already posed.", author: "Vartan Gregorian" },
  { text: "The wise do not accumulate. The more they do for others, the more they have.", author: "Lao Tzu" },
  { text: "A man who has never gone to school may steal from a freight car; but if he has a university education, he may steal the whole railroad.", author: "Franklin D. Roosevelt" },
  { text: "Mastery is not a function of genius or talent. It is a function of time and intense focus.", author: "Robert Greene" },
  { text: "No problem can be solved from the same level of consciousness that created it.", author: "Albert Einstein" },
  { text: "The intellect has little to do on the road to discovery. There comes a leap in consciousness, call it intuition or what you will, and the solution comes.", author: "Albert Einstein" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "What gets measured, gets managed.", author: "Peter Drucker" },
  { text: "Management is doing things right; leadership is doing the right things.", author: "Peter Drucker" },
  { text: "To improve is to change; to be perfect is to change often.", author: "Winston Churchill" },
  { text: "Culture eats strategy for breakfast.", author: "Peter Drucker" },
  { text: "The bamboo which bends is stronger than the oak which resists.", author: "Japanese Proverb" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Vision without action is a daydream. Action without vision is a nightmare.", author: "Japanese Proverb" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "Silence is a true friend who never betrays.", author: "Confucius" },
  { text: "The superior man is he who develops, in harmonious proportions, his moral, intellectual and physical condtion.", author: "Herbert Spencer" },
  { text: "The most dangerous phrase in the language is: 'We have always done it this way.'", author: "Grace Hopper" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
  { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
  { text: "It's not about ideas. It's about making ideas happen.", author: "Scott Belsky" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.", author: "Rumi" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "Let the beauty of what you love be what you do.", author: "Rumi" },
  { text: "Silence is the language of God; all else is poor translation.", author: "Rumi" },
  { text: "The truth is not for all men, but only for those who seek it.", author: "Ayn Rand" },
  { text: "A man can be destroyed but not defeated.", author: "Ernest Hemingway" },
  { text: "All you have to do is write one true sentence. Write the truest sentence that you know.", author: "Ernest Hemingway" },
  { text: "The first draft of anything is garbage.", author: "Ernest Hemingway" },
  { text: "I took a deep breath and listened to the old brag of my heart: I am, I am, I am.", author: "Sylvia Plath" },
  { text: "Not all readers are leaders, but all leaders are readers.", author: "Harry S. Truman" },
  { text: "Leadership and learning are indispensable to each other.", author: "John F. Kennedy" },
  { text: "Ask not what your country can do for you — ask what you can do for your country.", author: "John F. Kennedy" },
  { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Think before you speak. Read before you think.", author: "Fran Lebowitz" },
  { text: "The most common form of despair is not being who you are.", author: "Søren Kierkegaard" },
  { text: "To dare is to lose one's footing momentarily. Not to dare is to lose oneself.", author: "Søren Kierkegaard" },
  { text: "The self is only that which is in the process of becoming.", author: "Søren Kierkegaard" },
  { text: "Man's most fundamental need is not for knowledge, but for creativity.", author: "Ruth Nanda Anshen" },
  { text: "Education is the transmission of civilization.", author: "Will Durant" },
  { text: "We are what we think. All that we are arises with our thoughts.", author: "Buddha" },
  { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha" },
  { text: "Your work is to discover your world and then with all your heart give yourself to it.", author: "Buddha" },
  { text: "An investment in knowledge always pays the best dividends.", author: "Benjamin Franklin" },
  { text: "Energy cannot be created or destroyed, only transformed.", author: "Albert Einstein" },
  { text: "The measure of a man is what he does with power.", author: "Plato" },
  { text: "Good people do not need laws to tell them to act responsibly, while bad people will find a way around the laws.", author: "Plato" },
  { text: "Beauty is truth, truth beauty — that is all ye know on Earth, and all ye need to know.", author: "John Keats" },
  { text: "The forest would be silent if no bird sang except those that sang best.", author: "Henry Van Dyke" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius" },
  { text: "It takes a village to raise a child.", author: "African Proverb" },
  { text: "To test a perfect theory with imperfect instruments did not impress the Greek philosophers as either useful or interesting.", author: "Freeman Dyson" },
  { text: "Equipped with his five senses, man explores the universe around him and calls the adventure Science.", author: "Edwin Hubble" },
  { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
  { text: "For me, I am driven by two main philosophies: know more today about the world than I knew yesterday, and lessen the suffering of others.", author: "Neil deGrasse Tyson" },
  { text: "Each problem that I solved became a rule which served afterwards to solve other problems.", author: "René Descartes" },
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
