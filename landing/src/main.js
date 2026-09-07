// Character Matters Landing Page Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // 2. Character Pillar Tab Switching
  const pillarTabs = document.querySelectorAll('.pillar-tab');
  const pillarPanes = document.querySelectorAll('.pillar-pane');

  pillarTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetPillar = tab.getAttribute('data-pillar');

      // Update active tab button
      pillarTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active pane
      pillarPanes.forEach((pane) => {
        pane.classList.remove('active');
        if (pane.id === `pane-${targetPillar}`) {
          pane.classList.add('active');
        }
      });
    });
  });

  // 3. Pricing Toggle Switch (Monthly vs Annual)
  const pricingToggle = document.getElementById('pricingToggle');
  const heroPrice = document.getElementById('heroPrice');
  const heroPeriod = document.getElementById('heroPeriod');
  const schoolPrice = document.getElementById('schoolPrice');
  const schoolPeriod = document.getElementById('schoolPeriod');

  if (pricingToggle) {
    pricingToggle.addEventListener('change', (e) => {
      const isAnnual = e.target.checked;

      if (isAnnual) {
        // Annual pricing with 25% discount
        if (heroPrice) heroPrice.textContent = '7.99';
        if (heroPeriod) heroPeriod.textContent = '/ month billed annually';
        if (schoolPrice) schoolPrice.textContent = '19.99';
        if (schoolPeriod) schoolPeriod.textContent = '/ month billed annually';
      } else {
        // Standard monthly pricing
        if (heroPrice) heroPrice.textContent = '10.99';
        if (heroPeriod) heroPeriod.textContent = '/ month';
        if (schoolPrice) schoolPrice.textContent = '26.99';
        if (schoolPeriod) schoolPeriod.textContent = '/ month';
      }
    });
  }

  // 4. Video Demo Modal
  const playDemoBtn = document.getElementById('playDemoBtn');
  const videoModal = document.getElementById('videoModal');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');

  const openModal = () => {
    if (videoModal) {
      videoModal.classList.add('active');
      videoModal.setAttribute('aria-hidden', 'false');
    }
  };

  const closeModal = () => {
    if (videoModal) {
      videoModal.classList.remove('active');
      videoModal.setAttribute('aria-hidden', 'true');
    }
  };

  if (playDemoBtn) playDemoBtn.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
      closeModal();
    }
  });

  // 5. Header shadow on scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });
});
