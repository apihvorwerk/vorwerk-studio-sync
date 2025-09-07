import React, { useEffect, useCallback, useRef } from 'react';

interface InteractiveEnhancementsProps {
  children: React.ReactNode;
}

const InteractiveEnhancements: React.FC<InteractiveEnhancementsProps> = ({ children }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Smooth scroll enhancement
  const enhanceSmoothScrolling = useCallback(() => {
    // Add smooth scrolling to all anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            const headerOffset = 80; // Account for fixed header
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }, []);

  // Intersection Observer for animations
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.classList.remove('animate-out');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(
      '[class*="fade-in"], [class*="slide-in"], [class*="scale-in"], .card-responsive, .btn-responsive'
    );
    
    animatedElements.forEach((el) => {
      observerRef.current?.observe(el);
    });
  }, []);

  // Performance optimizations
  const setupPerformanceOptimizations = useCallback(() => {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));

    // Optimize scroll performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Add scroll-based effects here
          const scrollY = window.scrollY;
          const header = document.querySelector('nav');
          
          if (header) {
            if (scrollY > 100) {
              header.classList.add('scrolled');
            } else {
              header.classList.remove('scrolled');
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      imageObserver.disconnect();
    };
  }, []);

  // Touch and gesture enhancements
  const setupTouchEnhancements = useCallback(() => {
    // Add touch feedback to interactive elements
    const touchElements = document.querySelectorAll('button, .btn-responsive, [role="button"]');
    
    touchElements.forEach((element) => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      }, { passive: true });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      }, { passive: true });
    });

    // Swipe gesture detection for mobile
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Detect significant swipe (minimum 50px)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left
          document.dispatchEvent(new CustomEvent('swipeLeft'));
        } else {
          // Swipe right
          document.dispatchEvent(new CustomEvent('swipeRight'));
        }
      }
      
      startX = 0;
      startY = 0;
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Keyboard navigation enhancements
  const setupKeyboardEnhancements = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modals/overlays
      if (e.key === 'Escape') {
        const openModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        const openMenu = document.querySelector('.mobile-menu[aria-hidden="false"]');
        
        if (openModal) {
          const closeButton = openModal.querySelector('[aria-label*="close"], [aria-label*="Close"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        }
        
        if (openMenu) {
          const menuToggle = document.querySelector('[aria-label*="menu"], [aria-label*="Menu"]');
          if (menuToggle) {
            (menuToggle as HTMLElement).click();
          }
        }
      }
      
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Accessibility enhancements
  const setupAccessibilityEnhancements = useCallback(() => {
    // Announce page changes for screen readers
    const announcePageChange = (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Monitor route changes and announce them
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target === document.title) {
          announcePageChange(`Page changed to ${document.title}`);
        }
      });
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize all enhancements
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    
    // Setup all enhancements
    enhanceSmoothScrolling();
    setupIntersectionObserver();
    
    const performanceCleanup = setupPerformanceOptimizations();
    const touchCleanup = setupTouchEnhancements();
    const keyboardCleanup = setupKeyboardEnhancements();
    const accessibilityCleanup = setupAccessibilityEnhancements();
    
    if (performanceCleanup) cleanupFunctions.push(performanceCleanup);
    if (touchCleanup) cleanupFunctions.push(touchCleanup);
    if (keyboardCleanup) cleanupFunctions.push(keyboardCleanup);
    if (accessibilityCleanup) cleanupFunctions.push(accessibilityCleanup);

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    enhanceSmoothScrolling,
    setupIntersectionObserver,
    setupPerformanceOptimizations,
    setupTouchEnhancements,
    setupKeyboardEnhancements,
    setupAccessibilityEnhancements
  ]);

  return <>{children}</>;
};

export default InteractiveEnhancements;
