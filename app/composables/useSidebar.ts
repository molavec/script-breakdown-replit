import { onMounted, onUnmounted } from 'vue';

export const useSidebar = () => {
  // Shared reactive state across all components and pages
  const isOpen = useState<boolean>('app_sidebar_open', () => true);
  const isInitialized = useState<boolean>('app_sidebar_initialized', () => false);

  const isTabletOrMobile = (): boolean => {
    if (import.meta.client && typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const setOpen = (val: boolean) => {
    isOpen.value = val;
  };

  // Run on client mount to initialize state according to screen size (< 1024px tablet/mobile -> collapsed)
  if (import.meta.client) {
    onMounted(() => {
      if (!isInitialized.value) {
        isInitialized.value = true;
        // On tablet and smaller screens, sidebar is collapsed by default.
        // On screens larger than tablet (>= 1024px), sidebar is visible by default.
        isOpen.value = !isTabletOrMobile();
      }

      // Listen for window resize / media query changes
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        
        const handleBreakpointChange = (e: MediaQueryListEvent | MediaQueryList) => {
          isOpen.value = e.matches;
        };

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleBreakpointChange);
        } else {
          // Fallback for older browser APIs
          mediaQuery.addListener(handleBreakpointChange);
        }
      }
    });
  }

  return {
    isOpen,
    toggle,
    open,
    close,
    setOpen,
    isTabletOrMobile
  };
};
