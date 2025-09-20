document.addEventListener('DOMContentLoaded', () => {
    // =============================
    // Element Selectors
    // =============================
    const workshopTypeEl = document.getElementById('workshopType');
    const workshopPriceEl = document.getElementById('workshopPrice');
    const workshopHiddenPriceEl = document.getElementById('workshopTotalPrice');

    const serviceEl = document.getElementById('service');
    const hoursEl = document.getElementById('hours');
    const totalCostEl = document.getElementById('totalCost');
    const bookingHiddenPriceEl = document.getElementById('bookingTotalPrice');

    // =============================
    // Utilities
    // =============================
    function parsePriceFromString(str) {
        if (!str) return 15;
        const match = String(str).match(/\$(\d+(?:\.\d+)?)/);
        return match ? Number(match[1]) : 15;
    }

    // =============================
    // Workshop Price Calculation
    // =============================
    function updateWorkshopPrice() {
        if (!workshopTypeEl || !workshopPriceEl) return;
        const value = workshopTypeEl.value || '';
        const price = parsePriceFromString(value);
        workshopPriceEl.textContent = `Price: $${price}`;
        if (workshopHiddenPriceEl) workshopHiddenPriceEl.value = String(price);
    }

    workshopTypeEl?.addEventListener('change', updateWorkshopPrice);

    // =============================
    // Booking Price Calculation (non-invasive)
    // Keeps existing inline logic intact; acts as a safety net
    // =============================
    function updateBookingPrice() {
        if (!serviceEl || !hoursEl || !totalCostEl) return;
        const service = serviceEl.value;
        const hours = parseInt(hoursEl.value, 10) || 0;
        let rate = 0;
        if (service === 'portrait') rate = 30;
        else if (service === 'senior') rate = 20;
        else if (service === 'family') rate = 40;
        else if (service === 'pet') rate = 30;
        else if (service === 'event') rate = 45;
        else if (service === 'videography') rate = 40;
        const total = rate * hours;
        totalCostEl.textContent = `Total: $${total}`;
        if (bookingHiddenPriceEl) bookingHiddenPriceEl.value = String(total);
    }

    serviceEl?.addEventListener('change', updateBookingPrice);
    hoursEl?.addEventListener('input', updateBookingPrice);

    // =============================
    // Reveal-on-Scroll Animations (reduced motion aware)
    // =============================
    function setupRevealOnScroll() {
        const revealEls = document.querySelectorAll('.reveal');
        const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduce || !('IntersectionObserver' in window) || revealEls.length === 0) {
            revealEls.forEach(el => el.classList.add('reveal-visible'));
            return;
        }
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        });
        revealEls.forEach(el => io.observe(el));
    }

    // =============================
    // Form UX Improvements
    // =============================
    function setupFormSubmitStates() {
        const forms = [
            document.getElementById('bookingForm'),
            document.getElementById('workshopForm')
        ];
        forms.forEach(form => {
            if (!form) return;
            const submitBtn = form.querySelector('button[type="submit"]');
            form.addEventListener('submit', () => {
                if (submitBtn) {
                    submitBtn.dataset.originalText = submitBtn.textContent || '';
                    submitBtn.textContent = 'Sending...';
                    submitBtn.disabled = true;
                }
                form.setAttribute('aria-busy', 'true');
                // If page doesn't navigate (e.g., local preview), restore after timeout
                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
                        submitBtn.disabled = false;
                    }
                    form.removeAttribute('aria-busy');
                }, 6000);
            });
        });
    }

    function setupFormValidation() {
        const applyValidation = (form) => {
            if (!form) return;
            const submitBtn = form.querySelector('button[type="submit"]');
            const inputs = form.querySelectorAll('input, select, textarea');
            const updateState = () => {
                if (!submitBtn) return;
                submitBtn.disabled = !form.checkValidity();
            };
            inputs.forEach(el => {
                el.addEventListener('input', updateState);
                el.addEventListener('change', updateState);
            });
            updateState();
        };
        applyValidation(document.getElementById('bookingForm'));
        applyValidation(document.getElementById('workshopForm'));
    }

    // =============================
    // Scroll Spy (Active Nav Link)
    // =============================
    function setupScrollSpy() {
        const sections = Array.from(document.querySelectorAll('main section[id]'));
        const navLinks = Array.from(document.querySelectorAll('.header-center a[href^="#"]'));
        if (!('IntersectionObserver' in window) || sections.length === 0 || navLinks.length === 0) return;
        const linkMap = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = linkMap.get(id);
                if (!link) return;
                if (entry.isIntersecting) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }, { threshold: 0.5, rootMargin: '0px 0px -35% 0px' });
        sections.forEach(sec => io.observe(sec));
    }

    // =============================
    // Initialize
    // =============================
    updateWorkshopPrice();
    updateBookingPrice();
    setupRevealOnScroll();
    setupFormSubmitStates();
    setupFormValidation();
    setupScrollSpy();
});
