gsap.from(".hero h1", { opacity: 0, y: -50, duration: 1 });
gsap.from(".hero .btn", { opacity: 0, y: 50, duration: 1, delay: 0.5 });

gsap.from(".skills .skills-container", { opacity: 0, y: 30, duration: 1, delay: 0.3 });
gsap.from(".skills h2", { opacity: 0, y: 30, duration: 1, delay: 0.5 });
gsap.from(".skills img", { opacity: 0, y: 30, duration: 1, delay: 0.75 });
gsap.from(".portfolio h2", { opacity: 0, y: 30, duration: 1, delay: 1.5 });
gsap.from(".contact h2", { opacity: 0, y: 30, duration: 1, delay: 2 });
gsap.from("footer p", { opacity: 0, y: 30, duration: 1, delay: 2.5 });

const footer = document.querySelector("footer");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            footer.classList.add("visible");
        }
    });
}, {
    threshold: 0.5
});

observer.observe(footer);