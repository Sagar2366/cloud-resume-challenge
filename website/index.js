$(document).ready(function (e) {
    $win = $(window);
    $navbar = $('#header');
    $toggle = $('.toggle-button');
    var width = $navbar.width();
    toggle_onclick($win, $navbar, width);

    // resize event
    $win.resize(function () {
        toggle_onclick($win, $navbar, width);
    });

    $toggle.click(function (e) {
        $navbar.toggleClass("toggle-left");
    })

    // Initialize Typed first
    initializeTyped();

    // Then Gorilla Mode Setup (now includes Typed reinitialization)
    initGorillaMode();

    // Update counter on load
    updateCounter();
});

function toggle_onclick($win, $navbar, width) {
    if ($win.width() <= 768) {
        $navbar.css({ left: `-${width}px` });
    } else {
        $navbar.css({ left: '0px' });
    }
}

function initGorillaMode() {
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    body.classList.add(savedTheme);

    // Add Gorilla Toggle Button to Nav (unique touch!)
    const nav = document.querySelector('.d-flex.flex-column');
    let gorillaBtn = document.querySelector('.gorilla-toggle');
    if (!gorillaBtn) {
        gorillaBtn = document.createElement('a');
        gorillaBtn.href = '#';
        gorillaBtn.className = 'nav-item nav-link text-white-50 font-os font-size-16 gorilla-toggle';
        gorillaBtn.onclick = toggleGorillaMode;
        nav.appendChild(gorillaBtn);
    }
    gorillaBtn.innerHTML = savedTheme === 'gorilla' ? '🐒 Normal Mode' : '🦧 Gorilla Mode';

    // Inject Gorilla Emojis on Headings (subtle flair) - but skip the typed parents to avoid breaking animations
    if (savedTheme === 'gorilla') {
        // Mark typed parents to protect them
        const typedParents = document.querySelectorAll('h5:has(#typed), h5:has(#typed_2)');
        typedParents.forEach(el => el.classList.add('typed-protected'));

        document.querySelectorAll('h1, h5:not(.typed-protected)').forEach(el => {
            if (!el.innerHTML.includes('🦍')) el.innerHTML += ' 🦍';
        });
    }

    // Dynamic Footer Badge & Quote Rotator - use .footer-title since counter is removed
    const footerTitle = document.querySelector('.footer-title');
    if (savedTheme === 'gorilla' && footerTitle) {
        let badge = document.querySelector('.gorilla-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'gorilla-badge text-center mt-2';
            badge.innerHTML = '💪 180KG Deadlift Beast | <em>GetFitWithSagar</em>';
            footerTitle.appendChild(badge);
        }

        // Quote Rotator from your X posts
        let quoteEl = document.querySelector('#gorilla-quote');
        if (!quoteEl) {
            const quotes = [
                '"Got promoted to MTS3 Site Reliability Engineer at @VMware. Starting this new role with parents blessings. 🙏❤️"',
                '"180KG Deadlift. Not the smooth one but we did it again. 🦧🦍"',
                '"Kya kuch nahi krna padta he bhai sahab to keep yourself motivated 🤫🫣🫢"',
                '"Free CKAD playlist got a whole new look – Watch it here!"',
                '"Day15 of Linux the final boss series 😌🙌🏻"'
            ];
            quoteEl = document.createElement('div');
            quoteEl.className = 'quote-rotator text-center mt-1';
            quoteEl.id = 'gorilla-quote';
            footerTitle.appendChild(quoteEl);
            rotateQuotes(quotes, quoteEl);
        }
    }

    // Reinitialize Typed animations after DOM tweaks
    setTimeout(reinitializeTyped, 200);
}

function toggleGorillaMode(e) {
    e.preventDefault();
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'gorilla' ? 'light' : 'gorilla';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update button text
    const btn = document.querySelector('.gorilla-toggle');
    if (btn) {
        btn.innerHTML = newTheme === 'gorilla' ? '🐒 Normal Mode' : '🦧 Gorilla Mode';
    }

    // Clean up or add emojis (avoid typed parents)
    if (newTheme === 'gorilla') {
        // Mark typed parents to protect them
        const typedParents = document.querySelectorAll('h5:has(#typed), h5:has(#typed_2)');
        typedParents.forEach(el => el.classList.add('typed-protected'));

        document.querySelectorAll('h1, h5:not(.typed-protected)').forEach(el => {
            if (!el.innerHTML.includes('🦍')) el.innerHTML += ' 🦍';
        });
        // Re-add badge and quote if needed
        initGorillaElements();
    } else {
        // Clean up
        document.querySelectorAll('h1, h5').forEach(el => {
            el.innerHTML = el.innerHTML.replace(' 🦍', '');
        });
        document.querySelectorAll('.typed-protected').forEach(el => el.classList.remove('typed-protected')); // Clean class
        const badge = document.querySelector('.gorilla-badge');
        const quote = document.querySelector('#gorilla-quote');
        if (badge) badge.remove();
        if (quote) quote.remove();
    }

    // Reinitialize Typed after toggle to fix animations
    setTimeout(reinitializeTyped, 300);
}

function initGorillaElements() {
    // Re-init badge and quote (call if needed after toggle)
    const footerTitle = document.querySelector('.footer-title');
    if (footerTitle) {
        let badge = document.querySelector('.gorilla-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'gorilla-badge text-center mt-2';
            badge.innerHTML = '💪 180KG Deadlift Beast | <em>GetFitWithSagar</em>';
            footerTitle.appendChild(badge);
        }

        let quoteEl = document.querySelector('#gorilla-quote');
        if (!quoteEl) {
            const quotes = [
                '"Got promoted to MTS3 Site Reliability Engineer at @VMware. Starting this new role with parents blessings. 🙏❤️"',
                '"180KG Deadlift. Not the smooth one but we did it again. 🦧🦍"',
                '"Kya kuch nahi krna padta he bhai sahab to keep yourself motivated 🤫🫣🫢"',
                '"Free CKAD playlist got a whole new look – Watch it here!"',
                '"Day15 of Linux the final boss series 😌🙌🏻"'
            ];
            quoteEl = document.createElement('div');
            quoteEl.className = 'quote-rotator text-center mt-1';
            quoteEl.id = 'gorilla-quote';
            footerTitle.appendChild(quoteEl);
            rotateQuotes(quotes, quoteEl);
        }
    }
}

function rotateQuotes(quotes, element) {
    let index = 0;
    function showNext() {
        element.textContent = quotes[index];
        index = (index + 1) % quotes.length;
        setTimeout(showNext, 5000); // Rotate every 5s
    }
    showNext();
}

function initializeTyped() {
    // Initial Typed setup
    if (window.typedInstance) {
        window.typedInstance.destroy();
    }
    if (window.typed2Instance) {
        window.typed2Instance.destroy();
    }

    window.typedInstance = new Typed('#typed', {
        strings: [
            'SRE @ CrowdStrike',
            'DevOps Engineer',
            'Cloud Mentor'
        ],
        typeSpeed: 80,
        backSpeed: 80,
        loop: true
    });

    window.typed2Instance = new Typed('#typed_2', {
        strings: [
            'passionate SRE',
            'DevOps & Cloud Expert',
            'Open Source Enthusiast'
        ],
        typeSpeed: 80,
        backSpeed: 80,
        loop: true
    });
}

function reinitializeTyped() {
    // Destroy existing Typed instances if they exist
    if (window.typedInstance) {
        try {
            window.typedInstance.destroy();
        } catch (err) {
            // Ignore if already destroyed
        }
    }
    if (window.typed2Instance) {
        try {
            window.typed2Instance.destroy();
        } catch (err) {
            // Ignore if already destroyed
        }
    }

    // Small delay to ensure DOM is stable, then recreate
    setTimeout(function() {
        window.typedInstance = new Typed('#typed', {
            strings: [
                'SRE @ CrowdStrike',
                'DevOps Engineer',
                'Cloud Mentor'
            ],
            typeSpeed: 80,
            backSpeed: 80,
            loop: true
        });

        window.typed2Instance = new Typed('#typed_2', {
            strings: [
                'passionate SRE',
                'DevOps & Cloud Expert',
                'Open Source Enthusiast'
            ],
            typeSpeed: 80,
            backSpeed: 80,
            loop: true
        });
    }, 100);
}

function updateCounter() {
    const counters = document.querySelectorAll(".counter-number");
    if (counters.length === 0) return;

    fetch("https://wwjcx7tyxrbjmbkf3vc3teo3mu0qrvhq.lambda-url.ca-central-1.on.aws/")
        .then(response => {
            if (!response.ok) throw new Error('Fetch failed');
            return response.json();
        })
        .then(data => {
            counters.forEach(counter => {
                counter.innerHTML = `Views: ${data}`;
            });
        })
        .catch(error => {
            console.error('Counter fetch error:', error);
            counters.forEach(counter => {
                counter.innerHTML = `Views: 0`; // Fallback
            });
        });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});