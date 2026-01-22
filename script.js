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
    start: "top 1200%"
  },
  y: 100,
  opacity: 0,
  stagger: 0.3
});

/* FAQ toggle */
document.querySelectorAll(".faq").forEach(faq => {
  faq.addEventListener("click", () => {
    faq.classList.toggle("open");
  });
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
