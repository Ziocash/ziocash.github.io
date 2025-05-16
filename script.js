document.addEventListener("DOMContentLoaded", () => {
    // Theme functionality
    const themeToggle = document.getElementById("theme-toggle")
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

    // Function to set theme
    const setTheme = (theme) => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
        setTheme(savedTheme)
    } else if (prefersDarkScheme.matches) {
        setTheme("dark")
    } else {
        setTheme("light")
    }

    // Toggle theme when button is clicked
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme")
        const newTheme = currentTheme === "dark" ? "light" : "dark"
        setTheme(newTheme)
    })

    // Listen for system theme changes
    prefersDarkScheme.addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
            setTheme(e.matches ? "dark" : "light")
        }
    })

    // Check if we're on mobile or desktop
    const isMobile = window.innerWidth <= 768

    // ===== DESKTOP FUNCTIONALITY =====
    if (!isMobile) {
        // Slide functionality
        const slides = document.querySelectorAll(".slide")
        const totalSlides = slides.length
        let currentSlide = 0

        // Navigation elements
        const prevButton = document.getElementById("prev-slide")
        const nextButton = document.getElementById("next-slide")
        const slideCounter = document.getElementById("current-slide")
        const totalSlidesElement = document.getElementById("total-slides")
        const progressBar = document.querySelector(".progress-bar")
        const slideIndicatorsContainer = document.querySelector(".slide-indicators")

        // Set total slides
        totalSlidesElement.textContent = totalSlides

        // Create slide indicators
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement("div")
            indicator.classList.add("slide-indicator")
            if (i === 0) indicator.classList.add("active")
            indicator.addEventListener("click", () => goToSlide(i))
            slideIndicatorsContainer.appendChild(indicator)
        }

        // Update slide indicators
        function updateIndicators() {
            const indicators = document.querySelectorAll(".slide-indicator")
            indicators.forEach((indicator, index) => {
                if (index === currentSlide) {
                    indicator.classList.add("active")
                } else {
                    indicator.classList.remove("active")
                }
            })
        }

        // Update progress bar
        function updateProgressBar() {
            const progress = ((currentSlide + 1) / totalSlides) * 100
            progressBar.style.width = `${progress}%`
        }

        // Go to specific slide
        function goToSlide(index) {
            if (index < 0) index = 0
            if (index >= totalSlides) index = totalSlides - 1

            // Remove all classes
            slides.forEach((slide) => {
                slide.classList.remove("active", "prev")
            })

            // Add appropriate classes
            slides[index].classList.add("active")

            // Update current slide
            currentSlide = index

            // Update UI
            slideCounter.textContent = currentSlide + 1
            updateProgressBar()
            updateIndicators()

            // Animate content with GSAP
            animateSlideContent(slides[index])

            // Show/hide footer based on slide
            toggleFooter()

            // Load GitHub repos when portfolio slide is active
            if (index === 2 && !window.reposLoadedDesktop) {
                fetchGitHubRepos("desktop")
            }
        }

        // Next slide
        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                slides[currentSlide].classList.add("prev")
                goToSlide(currentSlide + 1)
            }
        }

        // Previous slide
        function prevSlide() {
            if (currentSlide > 0) {
                goToSlide(currentSlide - 1)
            }
        }

        // Event listeners
        prevButton.addEventListener("click", prevSlide)
        nextButton.addEventListener("click", nextSlide)

        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") {
                nextSlide()
            } else if (e.key === "ArrowLeft") {
                prevSlide()
            }
        })

        // Mouse wheel navigation with debounce
        let wheelTimeout = null
        const wheelDelay = 500 // ms between wheel events
        let isWheelEnabled = true

        document.addEventListener("wheel", (e) => {
            if (!isWheelEnabled) return

            isWheelEnabled = false

            // Clear any existing timeout
            if (wheelTimeout) {
                clearTimeout(wheelTimeout)
            }

            // Determine scroll direction
            if (e.deltaY > 0) {
                nextSlide()
            } else {
                prevSlide()
            }

            // Set timeout to re-enable wheel after delay
            wheelTimeout = setTimeout(() => {
                isWheelEnabled = true
            }, wheelDelay)
        })

        // Animate slide content with GSAP
        function animateSlideContent(slide) {
            // Reset any previous animations
            gsap.set(slide.querySelectorAll("h1, h2, h3, p, .btn, .skill-category, .project-card, .contact-card"), {
                opacity: 0,
                y: 20,
            })

            // Animate heading
            gsap.to(slide.querySelectorAll("h1, h2"), {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.2,
            })

            // Animate paragraphs
            gsap.to(slide.querySelectorAll("p"), {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.4,
            })

            // Animate buttons
            gsap.to(slide.querySelectorAll(".btn"), {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.6,
            })

            // Animate skill categories
            gsap.to(slide.querySelectorAll(".skill-category"), {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                delay: 0.4,
            })

            // Animate project cards
            gsap.to(slide.querySelectorAll(".project-card"), {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                delay: 0.4,
            })

            // Animate contact card
            gsap.to(slide.querySelectorAll(".contact-card"), {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.4,
            })
        }

        // Show footer when reaching the last slide
        function toggleFooter() {
            const footer = document.querySelector(".desktop-footer")
            if (currentSlide === totalSlides - 1) {
                footer.classList.add("visible")
            } else {
                footer.classList.remove("visible")
            }
        }

        // Initialize first slide
        goToSlide(0)
        animateSlideContent(slides[0])
    }
    // ===== END DESKTOP FUNCTIONALITY =====

    // ===== MOBILE FUNCTIONALITY =====
    else {
        // Mobile navigation
        const mobileNavItems = document.querySelectorAll(".mobile-nav-item")
        const mobileSections = document.querySelectorAll(".mobile-section")

        // Animate mobile sections on load
        gsap.from(mobileSections, {
            opacity: 0,
            y: 30,
            duration: 1,
            stagger: 0.2,
            delay: 0.5,
        })

        // Handle mobile navigation
        mobileNavItems.forEach((item) => {
            item.addEventListener("click", (e) => {
                // Prevent default anchor behavior
                e.preventDefault()

                // Get the target section
                const targetId = item.getAttribute("href")
                const targetSection = document.querySelector(targetId)

                // Scroll to the section
                targetSection.scrollIntoView({ behavior: "smooth" })

                // Update active nav item
                mobileNavItems.forEach((navItem) => {
                    navItem.classList.remove("active")
                })
                item.classList.add("active")
            })
        })

        // Intersection Observer for mobile sections
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.5,
        }

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id

                    // Update active nav item
                    mobileNavItems.forEach((item) => {
                        if (item.getAttribute("href") === `#${sectionId}`) {
                            item.classList.add("active")
                        } else {
                            item.classList.remove("active")
                        }
                    })

                    // Load GitHub repos when projects section is visible
                    if (sectionId === "mobile-projects" && !window.reposLoadedMobile) {
                        fetchGitHubRepos("mobile")
                    }
                }
            })
        }, observerOptions)

        // Observe all mobile sections
        mobileSections.forEach((section) => {
            sectionObserver.observe(section)
        })

        // Animate mobile elements
        gsap.from(".mobile-hero h1", { opacity: 0, y: -30, duration: 1, delay: 0.3 })
        gsap.from(".mobile-hero p", { opacity: 0, y: -20, duration: 1, delay: 0.5 })
        gsap.from(".mobile-buttons .btn", { opacity: 0, y: 20, duration: 1, stagger: 0.2, delay: 0.7 })
    }
    // ===== END MOBILE FUNCTIONALITY =====

    // ===== SHARED FUNCTIONALITY =====

    // GitHub Repositories Fetcher
    window.reposLoadedDesktop = false
    window.reposLoadedMobile = false

    async function fetchGitHubRepos(version) {
        const username = "ziocash"
        const containerId = version === "desktop" ? "github-repos-container-desktop" : "github-repos-container-mobile"
        const reposContainer = document.getElementById(containerId)

        if (!reposContainer) return

        // Check if we already have cached repos
        const cachedRepos = localStorage.getItem("github-repos")
        const cachedTimestamp = localStorage.getItem("github-repos-timestamp")
        const cacheExpiry = 3600000 // 1 hour in milliseconds

        // Use cached data if available and not expired
        if (cachedRepos && cachedTimestamp && Date.now() - Number.parseInt(cachedTimestamp) < cacheExpiry) {
            renderRepos(JSON.parse(cachedRepos), version)
            return
        }

        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)

            if (!response.ok) {
                throw new Error("Failed to fetch repositories")
            }

            const repos = await response.json()

            // Sort by stars
            const sortedRepos = repos
                .filter((repo) => !repo.fork) // Filter out forks
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 3) // Get top 3

            // Cache the results
            localStorage.setItem("github-repos", JSON.stringify(sortedRepos))
            localStorage.setItem("github-repos-timestamp", Date.now().toString())

            renderRepos(sortedRepos, version)
        } catch (error) {
            reposContainer.innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem; color: #e74c3c;"></i>
          <p>Could not load repositories. ${error.message}</p>
        </div>
      `
        }
    }

    function renderRepos(repos, version) {
        const containerId = version === "desktop" ? "github-repos-container-desktop" : "github-repos-container-mobile"
        const reposContainer = document.getElementById(containerId)
        const isMobile = version === "mobile"

        if (!reposContainer) return

        // Clear loading spinner
        reposContainer.innerHTML = ""

        // Language colors
        const languageColors = {
            JavaScript: "#f1e05a",
            TypeScript: "#2b7489",
            HTML: "#e34c26",
            CSS: "#563d7c",
            "C#": "#178600",
            Python: "#3572A5",
            Java: "#b07219",
            PHP: "#4F5D95",
            Ruby: "#701516",
            Go: "#00ADD8",
            Swift: "#ffac45",
            Kotlin: "#F18E33",
            Dart: "#00B4AB",
            Rust: "#dea584",
            Shell: "#89e051",
            PowerShell: "#012456",
            "Objective-C": "#438eff",
            "C++": "#f34b7d",
            C: "#555555",
            Other: "#ededed",
        }

        if (repos.length === 0) {
            reposContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
          <p>No repositories found.</p>
        </div>
      `
            return
        }

        repos.forEach((repo) => {
            const languageColor = languageColors[repo.language] || languageColors.Other

            const repoCard = document.createElement("div")
            repoCard.className = isMobile ? "mobile-project-card" : "project-card"

            const headerClass = isMobile ? "mobile-project-header" : "project-header"
            const contentClass = isMobile ? "mobile-project-content" : "project-content"
            const tagsClass = isMobile ? "mobile-project-tags" : "project-tags"
            const footerClass = isMobile ? "mobile-project-footer" : "project-footer"
            const linkClass = isMobile ? "mobile-project-link" : "project-link"

            repoCard.innerHTML = `
        <div class="${headerClass}">
          <h3>${repo.name}</h3>
          <p>${repo.description || "No description available"}</p>
        </div>
        <div class="${contentClass}">
          <div class="${tagsClass}">
            ${repo.topics
                    ? repo.topics
                        .slice(0, 4)
                        .map((topic) => `<span class="tag">${topic}</span>`)
                        .join("")
                    : ""
                }
          </div>
          <div class="repo-stats">
            <div class="repo-stat">
              <i class="fas fa-star"></i>
              <span>${repo.stargazers_count}</span>
            </div>
            <div class="repo-stat">
              <i class="fas fa-code-branch"></i>
              <span>${repo.forks_count}</span>
            </div>
          </div>
          ${repo.language
                    ? `
            <div class="repo-language">
              <span class="language-color" style="background-color: ${languageColor}"></span>
              <span>${repo.language}</span>
            </div>
          `
                    : ""
                }
        </div>
        <div class="${footerClass}">
          <a href="${repo.html_url}" target="_blank" class="${linkClass}">
            <i class="fab fa-github"></i> View Repository ${!isMobile ? '<i class="fas fa-external-link-alt"></i>' : ""}
          </a>
        </div>
      `

            reposContainer.appendChild(repoCard)
        })

        // Animate the repo cards
        if (version === "desktop") {
            gsap.from(`#${containerId} .project-card`, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                stagger: 0.2,
                delay: 0.2,
            })
            window.reposLoadedDesktop = true
        } else {
            gsap.from(`#${containerId} .mobile-project-card`, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                stagger: 0.2,
                delay: 0.2,
            })
            window.reposLoadedMobile = true
        }
    }
})
