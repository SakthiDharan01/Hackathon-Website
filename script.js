gsap.registerPlugin(ScrollTrigger);

/* Hero animation */
gsap.from(".hero h1", {
  y: 100,
  opacity: 0,
  duration: 1.2
});

gsap.from(".hero p", {
  y: 50,
  opacity: 0,
  delay: 0.4
});


/* Section animations */
gsap.from(".section", {
  scrollTrigger: {
    trigger: ".section",
    start: "top 150%"
  },
  y: 100,
  opacity: 0,
  stagger: 0.3
});


/* Cycling text */
const texts = ["Think 💡", "Innovate 🚀", "Code 🧑‍💻"];
let currentTextIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
const element = document.getElementById('cycling-text');

function typeWriter() {
  const currentText = texts[currentTextIndex];
  if (isDeleting) {
    element.textContent = currentText.substring(0, currentCharIndex--) + '|';
    if (currentCharIndex < 0) {
      isDeleting = false;
      currentTextIndex = (currentTextIndex + 1) % texts.length;
      setTimeout(typeWriter, 500); // pause before typing next
    } else {
      setTimeout(typeWriter, 50); // erase speed
    }
  } else {
    element.textContent = currentText.substring(0, currentCharIndex++) + '|';
    if (currentCharIndex > currentText.length) {
      isDeleting = true;
      setTimeout(typeWriter, 2000); // pause before deleting
    } else {
      setTimeout(typeWriter, 150); // typing speed
    }
  }
}

typeWriter();

/* FAQ toggle */
document.querySelectorAll(".faq-header").forEach(header => {
  header.addEventListener("click", () => {
    const item = header.parentElement;

    document.querySelectorAll(".faq-item").forEach(faq => {
      if (faq !== item) faq.classList.remove("active");
    });

    item.classList.toggle("active");
  });
});
    /* Lenis smooth scrolling initialization */
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      normalizeWheel: true
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Handle navbar anchor links for precise scrolling
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          lenis.scrollTo(targetElement, { offset: 0 });
        }
      });
    });
