// Smooth Scrolling with Custom Easing + Parallax integrated
class SmoothScroll {
  constructor() {
    this.currentScroll = window.pageYOffset || 0
    this.targetScroll = this.currentScroll
    this.ease = 0.1
    this.isTicking = false
    this.maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    // Elements for parallax (optional)
    this.mountainContainer = document.querySelector(".mountain-container")
    this.heroContent = document.querySelector(".hero-content")

    this.onWheel = this.onWheel.bind(this)
    this.onResize = this.onResize.bind(this)
    this.tick = this.tick.bind(this)

    this.init()
  }

  init() {
    // Wichtig: NICHT passiv, damit wir native Scrolls unterbinden können
    window.addEventListener("wheel", this.onWheel, { passive: false })
    window.addEventListener("resize", this.onResize, { passive: true })

    // Falls User via Scrollbar/Keyboard springt: Ziel nachziehen
    window.addEventListener("scroll", () => {
      // Nur übernehmen, wenn wir gerade NICHT aktiv animieren
      if (!this.isTicking) {
        this.currentScroll = window.pageYOffset
        this.targetScroll = this.currentScroll
      }
    }, { passive: true })
  }

  onResize() {
    // Ziel im gültigen Bereich halten
    this.targetScroll = Math.min(this.targetScroll, this.maxScroll())
  }

  onWheel(e) {
    // Native Scroll verhindern, wir übernehmen
    e.preventDefault()

    // Delta normalisieren (Lines vs Pixels)
    const factor = (e.deltaMode === 1) ? 16 : (e.deltaMode === 2) ? window.innerHeight : 1
    let delta = e.deltaY * factor

    // Clamp für Trackpads / High-Hz Wheels
    const MAX_STEP = 120 // px pro Event
    if (delta > MAX_STEP) delta = MAX_STEP
    if (delta < -MAX_STEP) delta = -MAX_STEP

    this.targetScroll += delta
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, this.maxScroll()))

    if (!this.isTicking) {
      this.isTicking = true
      requestAnimationFrame(this.tick)
    }
  }

  tick() {
    // Lerp
    this.currentScroll += (this.targetScroll - this.currentScroll) * this.ease

    // Stop-Kriterium
    if (Math.abs(this.targetScroll - this.currentScroll) < 0.5) {
      this.currentScroll = this.targetScroll
      window.scrollTo(0, Math.round(this.currentScroll))
      this.isTicking = false
      return
    }

    // Apply scroll (WRITE)
    window.scrollTo(0, Math.round(this.currentScroll))

    // Parallax gleich hier rendern (WRITE), keine extra scroll-Listener
    const y = this.currentScroll
    if (this.mountainContainer) {
      this.mountainContainer.style.transform = `translateY(${y * 0.5}px)`
    }
    if (this.heroContent) {
      const opacity = Math.max(0, 1 - y / 500)
      this.heroContent.style.opacity = opacity.toString()
      this.heroContent.style.transform = `translateY(${y * 0.3}px)`
    }

    requestAnimationFrame(this.tick)
  }
}

const smoothScroll = new SmoothScroll()

// IntersectionObserver bleibt, aber vermeide lange setTimeout-Ketten
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add("visible")
  }
}, observerOptions)

document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el))

// FAQ Accordion (unverändert)
const faqItems = document.querySelectorAll(".faq-item")
faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question")
  question.addEventListener("click", () => {
    const isActive = item.classList.contains("active")
    faqItems.forEach((other) => other.classList.remove("active"))
    if (!isActive) item.classList.add("active")
  })
})

// Stagger Delays
document.querySelectorAll(".stat-item").forEach((el, i) => el.style.transitionDelay = `${i * 100}ms`)
document.querySelectorAll(".info-card").forEach((el, i) => el.style.transitionDelay = `${i * 100}ms`)
