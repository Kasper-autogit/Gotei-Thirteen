
/* =========================================
   GOTEI THIRTEEN
   Cinematic Website Effects v1
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    // =====================================
    // 1. AUTOMATIC COPYRIGHT YEAR
    // =====================================

    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // =====================================
    // 2. SCROLL REVEAL ANIMATIONS
    // =====================================

    const revealElements = document.querySelectorAll(
        ".section-heading, .value-card, .event-card, " +
        ".member-card, .gallery-item, .about-text"
    );

    if ("IntersectionObserver" in window && !reducedMotion.matches) {

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");

                        currentObserver.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px 30px 0px"
            }
        );

        revealElements.forEach(element => {
            element.classList.add("reveal");
            observer.observe(element);
        });
    }


    // =====================================
    // 3. CRIMSON MOUSE GLOW
    // =====================================

    const hero = document.querySelector(".hero");

    if (hero && !reducedMotion.matches &&
        window.matchMedia("(pointer: fine)").matches) {

        hero.addEventListener("pointermove", event => {

            const bounds = hero.getBoundingClientRect();

            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;

            hero.style.setProperty("--mouse-x", `${x}px`);
            hero.style.setProperty("--mouse-y", `${y}px`);

        });
    }


    // =====================================
    // 4. INTERACTIVE MEMBER CARD TILT
    // =====================================

    const memberCards = document.querySelectorAll(
        ".member-card:not(.placeholder-card)"
    );

    if (!reducedMotion.matches &&
        window.matchMedia("(pointer: fine)").matches) {

        memberCards.forEach(card => {

            card.addEventListener("pointermove", event => {

                const rect = card.getBoundingClientRect();

                const x = (event.clientX - rect.left)
                    / rect.width;

                const y = (event.clientY - rect.top)
                    / rect.height;

                const rotateY = (x - 0.5) * 5;
                const rotateX = (0.5 - y) * 5;

                card.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) ` +
                    `rotateY(${rotateY}deg) translateY(-5px)`;

            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });

        });
    }


    // =====================================
    // 5. BACK TO TOP BUTTON
    // =====================================

    const backToTop = document.createElement("button");

    backToTop.className = "back-to-top";
    backToTop.textContent = "↑";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.type = "button";

    document.body.appendChild(backToTop);

    function updateBackToTop() {
        backToTop.classList.toggle(
            "visible",
            window.scrollY > 500
        );
    }

    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive: true }
    );

    updateBackToTop();

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
    });


    // =====================================
    // 6. WAR DRUMS TOGGLE
    // =====================================

    const soundToggle = document.getElementById("sound-toggle");
    const warDrumsAudio = document.getElementById("war-drums-audio");

    if (soundToggle && warDrumsAudio) {
        const soundLabel = soundToggle.querySelector(".sound-toggle-text");

        function setSoundState(isPlaying) {
            soundToggle.classList.toggle("is-playing", isPlaying);
            soundToggle.setAttribute("aria-pressed", String(isPlaying));
            if (soundLabel) {
                soundLabel.textContent = isPlaying ? "War Drums: On" : "War Drums: Off";
            }
        }

        setSoundState(false);

        soundToggle.addEventListener("click", async () => {
            if (warDrumsAudio.paused) {
                try {
                    await warDrumsAudio.play();
                    setSoundState(true);
                } catch (error) {
                    console.warn("War drums audio could not start.", error);
                    alert("Add the file assets/audio/war-drums-amaksi.mp3 first, then click the War Drums button again.");
                    setSoundState(false);
                }
            } else {
                warDrumsAudio.pause();
                setSoundState(false);
            }
        });

        warDrumsAudio.addEventListener("ended", () => setSoundState(false));
        warDrumsAudio.addEventListener("pause", () => {
            if (warDrumsAudio.currentTime > 0 && !warDrumsAudio.ended) {
                setSoundState(false);
            }
        });
    }

    console.log(
        "⚔ Gotei Thirteen — One Guild. One Goal. ⚔"
    );

});
