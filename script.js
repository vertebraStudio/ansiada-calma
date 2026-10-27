// Cada página empieza arriba: el navegador no restaura la posición al recargar ni al volver atrás
// (los enlaces a una sección, como index.html#sobre-mi, siguen llevando a esa sección)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('pageshow', function(event) {
    if (event.persisted && !location.hash) {
        window.scrollTo(0, 0);
    }
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Desplazamiento a secciones: arranca al momento y frena con suavidad (easeOutQuart).
    // Descuenta la cabecera compacta y, en las páginas de terapia, la barra de secciones.
    const reduceScrollMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scrollFrame = null;
    const cancelScroll = () => cancelAnimationFrame(scrollFrame);
    ['wheel', 'touchstart', 'keydown'].forEach(evt => window.addEventListener(evt, cancelScroll, { passive: true }));

    function scrollToSection(target) {
        const sectionNav = document.querySelector('.section-nav');
        const offset = 64 + (sectionNav ? sectionNav.offsetHeight : 0);
        const end = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
        const start = window.scrollY;
        const distance = end - start;
        if (reduceScrollMotion || Math.abs(distance) < 2) {
            window.scrollTo(0, end);
            return;
        }
        const duration = Math.min(850, Math.max(450, Math.abs(distance) * 0.3));
        const startTime = performance.now();
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
        cancelScroll();
        const step = now => {
            const progress = Math.min((now - startTime) / duration, 1);
            window.scrollTo(0, start + distance * easeOutQuart(progress));
            if (progress < 1) {
                scrollFrame = requestAnimationFrame(step);
            }
        };
        scrollFrame = requestAnimationFrame(step);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Ignore placeholder hashes to avoid errors and let other handlers run
            if (!targetId || targetId === '#') {
                return;
            }
            const targetSection = document.querySelector(targetId);
            if (!targetSection) {
                return;
            }
            e.preventDefault();
            scrollToSection(targetSection);
        });
    });

    // Header background change on scroll
    const header = document.querySelector('.header');
    
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    // Altura real de la cabecera (cambia al encogerse) para pegar la barra de secciones justo debajo
    const syncHeaderHeight = () => document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    if ('ResizeObserver' in window) {
        new ResizeObserver(syncHeaderHeight).observe(header);
    }
    syncHeaderHeight();

    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const phone = this.querySelector('input[type="tel"]').value;
            const message = this.querySelector('textarea').value;
            
            // Basic validation
            if (!name || !email || !message) {
                showNotification('Por favor, completa todos los campos obligatorios.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Por favor, introduce un email válido.', 'error');
                return;
            }
            
            // Simulate form submission
            showNotification('Enviando mensaje...', 'info');
            
            setTimeout(() => {
                showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                this.reset();
            }, 2000);
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

         // Observe elements for animation
     const animatedElements = document.querySelectorAll('.card, .terapia-text, .sobre-text, .contact-info, .formacion-item');
    
    // Sin animación de entrada si el usuario prefiere menos movimiento
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    animatedElements.forEach(el => {
        if (prefersReducedMotion) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isOpen = navMenu.classList.toggle('active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        // Close menu when a leaf link is clicked (but keep open for dropdown toggles on mobile)
        navMenu.addEventListener('click', function(e) {
            const anchor = e.target.closest('a');
            if (!anchor) return;
            const isMobile = window.matchMedia('(max-width: 1024px)').matches;
            const isDropdownToggle = !!anchor.closest('.dropdown') && (!anchor.getAttribute('href') || anchor.getAttribute('href') === '#');
            if (isMobile && isDropdownToggle) {
                // Let dropdown click handler manage opening; do not close entire menu
                return;
            }
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav') && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                // Also close any open dropdowns
                document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
            }
        });
    }

    // Dropdown functionality for navigation items
    const dropdownItems = document.querySelectorAll('.dropdown');
    
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        
        link.addEventListener('click', function(e) {
            const isMobile = window.matchMedia('(max-width: 1024px)').matches;
            const href = this.getAttribute('href');
            
            // En escritorio, no interferir con hover; en móvil, abrir por click
            if (!isMobile) {
                // Si el enlace apunta a una página, permitir navegación normal
                return;
            }
            
            // En móvil: si es un enlace real distinto de '#', navegar normalmente
            if (href && href !== '#') {
                return;
            }
            
            e.preventDefault();
            
            // Cerrar otros dropdowns
            dropdownItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Alternar dropdown actual
            const nowActive = item.classList.toggle('active');
            // Accesibilidad: indicar expandido en el trigger
            link.setAttribute('aria-expanded', nowActive ? 'true' : 'false');
        });
    });

    // Close dropdowns when clicking outside (solo en móvil)
    document.addEventListener('click', function(e) {
        const isMobile = window.matchMedia('(max-width: 1024px)').matches;
        if (isMobile && !e.target.closest('.dropdown')) {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    // Parallax sutil del fondo de la portada (no se aplica si el usuario prefiere menos movimiento)
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    if (hero && heroBackground && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let parallaxQueued = false;
        const updateParallax = () => {
            const y = Math.min(window.scrollY, hero.offsetHeight);
            heroBackground.style.transform = `translate3d(0, ${(y * 0.25).toFixed(1)}px, 0)`;
            parallaxQueued = false;
        };
        window.addEventListener('scroll', () => {
            if (!parallaxQueued) {
                parallaxQueued = true;
                requestAnimationFrame(updateParallax);
            }
        }, { passive: true });
        updateParallax();
    }

    // Move Sobre Mí image under H2 on mobile, restore on desktop
    (function() {
        const aboutContent = document.querySelector('#sobre-mi .sobre-content');
        if (!aboutContent) return;
        const aboutText = aboutContent.querySelector('.sobre-text');
        let aboutImage = aboutContent.querySelector('.sobre-image');
        if (!aboutText || !aboutImage) return;

        let placeholder = null;
        const mm = window.matchMedia('(max-width: 768px)');

        function moveImageIntoText() {
            // Already moved?
            if (!aboutImage || !aboutText) return;
            const h2 = aboutText.querySelector('h2');
            if (!h2) return;
            if (!placeholder) {
                placeholder = document.createElement('div');
                placeholder.className = 'sobre-image-placeholder';
                aboutContent.insertBefore(placeholder, aboutImage);
            }
            // Insert image right after H2
            h2.insertAdjacentElement('afterend', aboutImage);
        }

        function restoreImagePosition() {
            if (placeholder && placeholder.parentNode && aboutImage) {
                placeholder.parentNode.insertBefore(aboutImage, placeholder);
                placeholder.remove();
                placeholder = null;
            }
        }

        function applyAboutLayout(e) {
            const isMobile = typeof e?.matches === 'boolean' ? e.matches : mm.matches;
            if (isMobile) {
                moveImageIntoText();
            } else {
                restoreImagePosition();
            }
        }

        // Initial apply and listener
        applyAboutLayout();
        if (typeof mm.addEventListener === 'function') {
            mm.addEventListener('change', applyAboutLayout);
        } else if (typeof mm.addListener === 'function') {
            mm.addListener(applyAboutLayout);
        }
    })();

    // Año actual en el pie
    document.querySelectorAll('[data-current-year]').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
 });

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    .notification-message {
        flex: 1;
    }
    
`;

// Consulta Photos Carousel Functionality
document.addEventListener('DOMContentLoaded', function() {
    const carouselTrack = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    
    if (!carouselTrack || !prevBtn || !nextBtn) return;
    
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    
    function updateCarousel() {
        const translateX = -currentSlide * 100;
        carouselTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
            dot.setAttribute('aria-current', index === currentSlide);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }
    
    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });
    
    // Auto-play: se pausa con el ratón o el foco encima y no arranca si el usuario prefiere menos movimiento
    let autoPlayInterval;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    function startAutoPlay() {
        if (reduceMotion) return;
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Start auto-play
    startAutoPlay();
    
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
        carouselContainer.addEventListener('focusin', stopAutoPlay);
        carouselContainer.addEventListener('focusout', startAutoPlay);
        
        // Keyboard navigation (solo con el foco dentro del carrusel)
        carouselContainer.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });
    }
});

document.head.appendChild(notificationStyles); 