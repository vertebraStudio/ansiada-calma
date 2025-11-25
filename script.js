// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for all anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Ignore placeholder hashes to avoid errors and let other handlers run
            if (!targetId || targetId === '#') {
                return;
            }
            e.preventDefault();
            
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                // Add a subtle visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Smooth scroll with easing
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 1000; // 1 second
                let start = null;
                
                function animation(currentTime) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                }
                
                function easeInOutCubic(t, b, c, d) {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t * t + b;
                    t -= 2;
                    return c / 2 * (t * t * t + 2) + b;
                }
                
                requestAnimationFrame(animation);
                
                // Add highlight effect to target section
                setTimeout(() => {
                    targetSection.style.transition = 'box-shadow 0.5s ease';
                    targetSection.style.boxShadow = '0 0 30px rgba(233, 30, 99, 0.3)';
                    setTimeout(() => {
                        targetSection.style.boxShadow = 'none';
                    }, 2000);
                }, 1000);
            }
        });
    });

    // Header background change on scroll
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(248, 249, 250, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '#f8f9fa';
            header.style.backdropFilter = 'none';
        }
    });

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
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
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
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
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
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
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
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile && !e.target.closest('.dropdown')) {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    // Disabled parallax effect to keep hero background fixed relative to content
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    if (hero && heroBackground) {
        heroBackground.style.transform = 'none';
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

         // Add loading animation
     window.addEventListener('load', function() {
         document.body.classList.add('loaded');
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
    
    /* Loading animation */
    body:not(.loaded) {
        overflow: hidden;
    }
    
    body:not(.loaded)::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #f8f9fa;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    body:not(.loaded)::after {
        content: 'Ansiada Calma';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        font-weight: 600;
        color: #2c3e50;
        z-index: 10000;
    }
    
    /* Dropdown styles */
    .dropdown {
        position: relative;
    }
    
    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 0.5rem 0;
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    }
    
    .dropdown.active .dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .dropdown-menu a {
        display: block;
        padding: 0.75rem 1rem;
        color: #2c3e50;
        text-decoration: none;
        transition: background-color 0.3s ease;
    }
    
    .dropdown-menu a:hover {
        background-color: #f8f9fa;
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
    
    // Auto-play (optional)
    let autoPlayInterval;
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Start auto-play
    startAutoPlay();
    
    // Pause auto-play on hover
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
});

document.head.appendChild(notificationStyles); 