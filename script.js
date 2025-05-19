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
        let isAnimating = false // Flag to prevent animation overlap

        // Track visited slides to avoid reanimating content
        const visitedSlides = new Set([0]) // Start with first slide as visited

        // Navigation elements
        const prevButton = document.getElementById("prev-slide")
        const nextButton = document.getElementById("next-slide")
        const slideCounter = document.getElementById("current-slide")
        const totalSlidesElement = document.getElementById("total-slides")
        const progressBar = document.querySelector(".progress-bar")

        // Set total slides
        if (totalSlidesElement) {
            totalSlidesElement.textContent = totalSlides.toString()
        }

        // Update progress bar
        function updateProgressBar() {
            if (progressBar) {
                const progress = ((currentSlide + 1) / totalSlides) * 100
                progressBar.style.width = `${progress}%`
            }
        }

        // Go to specific slide with fluid animation
        function goToSlide(index) {
            // Don't do anything if we're already on this slide or animation is in progress
            if (index === currentSlide || isAnimating) return

            // Set animating flag
            isAnimating = true

            // Determine direction for transition effect
            const direction = index > currentSlide ? 1 : -1
            const isBackwardNavigation = direction === -1

            // Check if this is a new slide or one we've visited before
            const isNewSlide = !visitedSlides.has(index)

            // Add this slide to visited slides
            visitedSlides.add(index)

            // Get current and target slides
            const currentSlideElement = slides[currentSlide]
            const targetSlide = slides[index]

            // Update current slide index
            currentSlide = index

            // Update UI elements
            if (slideCounter) {
                slideCounter.textContent = (currentSlide + 1).toString()
            }
            updateProgressBar()

            // Show/hide footer based on slide
            toggleFooter()

            // Create a timeline for smoother transitions
            const tl = gsap.timeline({
                defaults: { ease: "power2.inOut" },
                onComplete: () => {
                    // Reset animating flag
                    isAnimating = false

                    // Load GitHub repos when portfolio slide is active
                    if (index === 2 && !window.reposLoadedDesktop) {
                        fetchGitHubRepos("desktop")
                    }
                },
            })

            // Add animations to timeline - different behavior for forward/backward
            tl.to(currentSlideElement, {
                opacity: 0,
                duration: isBackwardNavigation ? 0.2 : 0.3, // Faster exit when going back
                onComplete: () => {
                    // Hide previous slide
                    currentSlideElement.classList.remove("active")

                    // Position target slide
                    targetSlide.classList.add("active")
                },
            }).fromTo(
                targetSlide,
                {
                    opacity: 0,
                    x: direction * (isBackwardNavigation ? 15 : 30), // Less movement when going back
                },
                {
                    opacity: 1,
                    x: 0,
                    duration: isBackwardNavigation ? 0.3 : 0.4, // Slightly faster when going back
                    onComplete: () => {
                        // Only animate content for new slides or use minimal animation for revisited slides
                        if (isNewSlide) {
                            animateSlideContent(targetSlide, false)
                        } else {
                            // For revisited slides, show content immediately with minimal animation
                            showSlideContentImmediately(targetSlide)
                        }
                    },
                },
            )
        }

        // Next slide
        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
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
        if (prevButton) prevButton.addEventListener("click", prevSlide)
        if (nextButton) nextButton.addEventListener("click", nextSlide)

        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") {
                nextSlide()
            } else if (e.key === "ArrowLeft") {
                prevSlide()
            }
        })

        // Mouse wheel navigation - more responsive
        let wheelTimeout = null
        const wheelDelay = 400 // Reduced delay for more responsiveness

        document.addEventListener("wheel", (e) => {
            // If animation is in progress, don't do anything
            if (isAnimating) return

            // Clear any existing timeout
            if (wheelTimeout) {
                clearTimeout(wheelTimeout)
            }

            // Set a new timeout
            wheelTimeout = setTimeout(() => {
                // Determine scroll direction
                if (e.deltaY > 0) {
                    nextSlide()
                } else {
                    prevSlide()
                }
            }, 50) // Very short delay for immediate response
        })

        // Show slide content immediately (for revisited slides)
        function showSlideContentImmediately(slide) {
            if (!slide) return

            // Define elements to animate
            const headings = slide.querySelectorAll("h1, h2")
            const paragraphs = slide.querySelectorAll("p")
            const buttons = slide.querySelectorAll(".btn")
            const skillCategories = slide.querySelectorAll(".skill-category")
            const projectCards = slide.querySelectorAll(".project-card")
            const socialCard = slide.querySelector(".social-card")
            const socialLinkCards = slide.querySelectorAll(".social-link-card")
            const skillExplanations = slide.querySelectorAll(".skill-explanation")

            // Create a timeline with minimal animation
            const tl = gsap.timeline({
                defaults: { ease: "power1.out", duration: 0.2 },
            })

            // Add subtle fade-in animations
            if (headings.length > 0) {
                tl.fromTo(headings, { opacity: 0.8 }, { opacity: 1 }, 0)
            }

            if (paragraphs.length > 0) {
                tl.fromTo(paragraphs, { opacity: 0.8 }, { opacity: 1 }, 0)
            }

            if (buttons.length > 0) {
                tl.fromTo(buttons, { opacity: 0.8 }, { opacity: 1 }, 0)
            }

            if (skillCategories.length > 0) {
                tl.fromTo(skillCategories, { opacity: 0.8 }, { opacity: 1 }, 0)
            }

            if (skillExplanations.length > 0) {
                tl.fromTo(skillExplanations, { opacity: 0.8 }, { opacity: 1 }, 0)
            }

            if (projectCards.length > 0) {
                tl.fromTo(projectCards, { opacity: 0.8 }, { opacity: 1 }, 0)
            }

            if (socialCard) {
                tl.fromTo(socialCard, { opacity: 0.8 }, { opacity: 1 }, 0)
            }

            if (socialLinkCards.length > 0) {
                tl.fromTo(socialLinkCards, { opacity: 0.8 }, { opacity: 1 }, 0)
            }
        }

        // Simplified content animation for better performance
        function animateSlideContent(slide, isRevisited = false) {
            if (!slide) return

            // Define elements to animate
            const headings = slide.querySelectorAll("h1, h2")
            const paragraphs = slide.querySelectorAll("p")
            const buttons = slide.querySelectorAll(".btn")
            const skillCategories = slide.querySelectorAll(".skill-category")
            const projectCards = slide.querySelectorAll(".project-card")
            const socialCard = slide.querySelector(".social-card")
            const socialLinkCards = slide.querySelectorAll(".social-link-card")
            const skillExplanations = slide.querySelectorAll(".skill-explanation")

            // Create a timeline with better easing
            const tl = gsap.timeline({
                defaults: {
                    ease: "power1.out",
                    duration: isRevisited ? 0.2 : 0.4, // Shorter duration for revisited slides
                },
            })

            // Add animations to timeline - simplified for better performance
            if (headings.length > 0) {
                tl.fromTo(
                    headings,
                    { opacity: 0, y: isRevisited ? 5 : 15 },
                    { opacity: 1, y: 0, stagger: isRevisited ? 0.03 : 0.08 },
                    0,
                )
            }

            if (paragraphs.length > 0) {
                tl.fromTo(
                    paragraphs,
                    { opacity: 0, y: isRevisited ? 5 : 15 },
                    { opacity: 1, y: 0, stagger: isRevisited ? 0.03 : 0.08 },
                    isRevisited ? 0 : 0.1,
                )
            }

            if (buttons.length > 0) {
                tl.fromTo(buttons, { opacity: 0, y: isRevisited ? 5 : 15 }, { opacity: 1, y: 0 }, isRevisited ? 0 : 0.2)
            }

            if (skillCategories.length > 0) {
                tl.fromTo(
                    skillCategories,
                    { opacity: 0, y: isRevisited ? 5 : 15 },
                    { opacity: 1, y: 0, stagger: isRevisited ? 0.03 : 0.08 },
                    isRevisited ? 0 : 0.2,
                )
            }

            if (skillExplanations.length > 0) {
                tl.fromTo(
                    skillExplanations,
                    { opacity: 0, y: isRevisited ? 5 : 15 },
                    { opacity: 1, y: 0, stagger: isRevisited ? 0.03 : 0.08 },
                    isRevisited ? 0 : 0.3,
                )
            }

            if (projectCards.length > 0) {
                tl.fromTo(
                    projectCards,
                    { opacity: 0, y: isRevisited ? 5 : 15 },
                    { opacity: 1, y: 0, stagger: isRevisited ? 0.03 : 0.08 },
                    isRevisited ? 0 : 0.2,
                )
            }

            if (socialCard) {
                tl.fromTo(socialCard, { opacity: 0, y: isRevisited ? 5 : 15 }, { opacity: 1, y: 0 }, isRevisited ? 0 : 0.2)
            }

            if (socialLinkCards.length > 0) {
                tl.fromTo(
                    socialLinkCards,
                    { opacity: 0, y: isRevisited ? 5 : 15 },
                    { opacity: 1, y: 0, stagger: isRevisited ? 0.03 : 0.08 },
                    isRevisited ? 0 : 0.3,
                )
            }
        }

        // Show footer when reaching the last slide
        function toggleFooter() {
            const footer = document.querySelector(".desktop-footer")
            if (footer) {
                if (currentSlide === totalSlides - 1) {
                    footer.classList.add("visible")
                } else {
                    footer.classList.remove("visible")
                }
            }
        }

        // Show navigation tooltip with keyboard hints
        function showNavigationTooltip() {
            const tooltip = document.getElementById("navigation-tooltip")
            if (tooltip) {
                // Update tooltip to include keyboard shortcuts
                tooltip.innerHTML = `
          <i class="fas fa-mouse"></i>
          <span>Use mouse wheel or arrow keys (←→) to navigate</span>
        `

                // Show tooltip with animation
                setTimeout(() => {
                    tooltip.classList.add("visible")
                }, 1000)

                // Hide tooltip after 5 seconds
                setTimeout(() => {
                    tooltip.classList.remove("visible")
                }, 6000)
            }
        }

        // Initialize first slide
        if (slides.length > 0) {
            slides[0].classList.add("active")
            animateSlideContent(slides[0])
            updateProgressBar()
        }

        // Show navigation tooltip
        showNavigationTooltip()
    }
    // ===== END DESKTOP FUNCTIONALITY =====

    // ===== MOBILE FUNCTIONALITY =====
    else {
        // Mobile navigation
        const mobileNavItems = document.querySelectorAll(".mobile-nav-item")
        const mobileSections = document.querySelectorAll(".mobile-section")

        // Track visited sections to avoid reanimating content
        const visitedSections = new Set(["mobile-intro"]) // Start with intro as visited

        // Animate mobile sections on load - with smoother animation
        if (mobileSections.length > 0) {
            gsap.fromTo(
                mobileSections,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power1.out",
                    delay: 0.3,
                },
            )
        }

        // Handle mobile navigation
        mobileNavItems.forEach((item) => {
            item.addEventListener("click", (e) => {
                // Prevent default anchor behavior
                e.preventDefault()

                // Get the target section
                const targetId = item.getAttribute("href")
                if (!targetId) return

                const targetSection = document.querySelector(targetId)
                if (!targetSection) return

                // Add to visited sections
                visitedSections.add(targetId.substring(1)) // Remove the # from the ID

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
            threshold: 0.3, // Lower threshold for earlier detection
        }

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id

                    // Check if this is a new section
                    const isNewSection = !visitedSections.has(sectionId)

                    // Add to visited sections
                    visitedSections.add(sectionId)

                    // Update active nav item
                    mobileNavItems.forEach((item) => {
                        const href = item.getAttribute("href")
                        if (href && href === `#${sectionId}`) {
                            item.classList.add("active")
                        } else {
                            item.classList.remove("active")
                        }
                    })

                    // Load GitHub repos when projects section is visible
                    if (sectionId === "mobile-projects" && !window.reposLoadedMobile) {
                        fetchGitHubRepos("mobile")
                    }

                    // Animate section content if it's new
                    if (isNewSection) {
                        animateMobileSectionContent(entry.target)
                    }
                }
            })
        }, observerOptions)

        // Observe all mobile sections
        mobileSections.forEach((section) => {
            sectionObserver.observe(section)
        })

        // Function to animate mobile section content
        function animateMobileSectionContent(section) {
            if (!section) return

            // Skip animation for already visited sections
            if (section.classList.contains("animated")) return

            // Mark as animated
            section.classList.add("animated")

            // Get elements to animate based on section ID
            const sectionId = section.id

            if (sectionId === "mobile-intro") {
                const mobileHeroH1 = section.querySelector(".mobile-hero h1")
                const mobileHeroP = section.querySelector(".mobile-hero p")
                const mobileButtons = section.querySelectorAll(".mobile-buttons .btn")

                // Create a timeline for mobile intro animations
                const mobileTl = gsap.timeline({
                    defaults: { ease: "power1.out", duration: 0.5 },
                })

                if (mobileHeroH1) {
                    mobileTl.fromTo(mobileHeroH1, { opacity: 0, y: -20 }, { opacity: 1, y: 0 }, 0.2)
                }

                if (mobileHeroP) {
                    mobileTl.fromTo(mobileHeroP, { opacity: 0, y: -15 }, { opacity: 1, y: 0 }, 0.3)
                }

                if (mobileButtons.length > 0) {
                    mobileTl.fromTo(mobileButtons, { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1 }, 0.4)
                }
            } else if (sectionId === "mobile-skills") {
                const skillCategories = section.querySelectorAll(".mobile-skill-category")
                const skillExplanations = section.querySelectorAll(".mobile-skill-explanation")

                const mobileTl = gsap.timeline({
                    defaults: { ease: "power1.out", duration: 0.5 },
                })

                if (skillCategories.length > 0) {
                    mobileTl.fromTo(skillCategories, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, 0)
                }

                if (skillExplanations.length > 0) {
                    mobileTl.fromTo(skillExplanations, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 }, 0.3)
                }
            } else if (sectionId === "mobile-projects") {
                const projectCards = section.querySelectorAll(".mobile-project-card")

                if (projectCards.length > 0) {
                    gsap.fromTo(
                        projectCards,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power1.out" },
                    )
                }
            } else if (sectionId === "mobile-contact") {
                const socialCard = section.querySelector(".mobile-social-card")
                const socialLinkCards = section.querySelectorAll(".mobile-social-link-card")
                const aboutMe = section.querySelector(".mobile-about-me")

                const mobileTl = gsap.timeline({
                    defaults: { ease: "power1.out", duration: 0.5 },
                })

                if (socialCard) {
                    mobileTl.fromTo(socialCard, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0)
                }

                if (socialLinkCards.length > 0) {
                    mobileTl.fromTo(socialLinkCards, { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1 }, 0.2)
                }

                if (aboutMe) {
                    mobileTl.fromTo(aboutMe, { opacity: 0, y: 15 }, { opacity: 1, y: 0 }, 0.4)
                }
            }
        }

        // Animate mobile elements on initial load
        const mobileHeroH1 = document.querySelector(".mobile-hero h1")
        const mobileHeroP = document.querySelector(".mobile-hero p")
        const mobileButtons = document.querySelectorAll(".mobile-buttons .btn")

        // Create a timeline for mobile intro animations
        const mobileTl = gsap.timeline({
            defaults: { ease: "power1.out", duration: 0.5 },
        })

        if (mobileHeroH1) {
            mobileTl.fromTo(mobileHeroH1, { opacity: 0, y: -20 }, { opacity: 1, y: 0 }, 0.2)
        }

        if (mobileHeroP) {
            mobileTl.fromTo(mobileHeroP, { opacity: 0, y: -15 }, { opacity: 1, y: 0 }, 0.3)
        }

        if (mobileButtons.length > 0) {
            mobileTl.fromTo(mobileButtons, { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1 }, 0.4)
        }

        // Mark intro section as animated
        const introSection = document.getElementById("mobile-intro")
        if (introSection) {
            introSection.classList.add("animated")
        }
    }
    // ===== END MOBILE FUNCTIONALITY =====

    // ===== SHARED FUNCTIONALITY =====

    // GitHub Repositories Fetcher
    window.reposLoadedDesktop = false
    window.reposLoadedMobile = false

    async function fetchGitHubRepos(version, silent = false) {
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
            // Only show loading spinner if not silent
            if (!silent) {
                reposContainer.innerHTML = `
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading repositories...</p>
          </div>
        `
            }

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
            if (reposContainer) {
                reposContainer.innerHTML = `
          <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem; color: #e74c3c;"></i>
            <p>Could not load repositories. ${error.message}</p>
          </div>
        `
            }
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
            ${repo.topics && repo.topics.length > 0
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

        // Animate the repo cards with smoother animations
        if (version === "desktop") {
            const projectCards = document.querySelectorAll(`#${containerId} .project-card`)
            if (projectCards.length > 0) {
                gsap.fromTo(
                    projectCards,
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: "power1.out",
                    },
                )
            }
            window.reposLoadedDesktop = true
        } else {
            const mobileProjectCards = document.querySelectorAll(`#${containerId} .mobile-project-card`)
            if (mobileProjectCards.length > 0) {
                gsap.fromTo(
                    mobileProjectCards,
                    { opacity: 0, y: 15 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: "power1.out",
                    },
                )
            }
            window.reposLoadedMobile = true
        }
    }
})
