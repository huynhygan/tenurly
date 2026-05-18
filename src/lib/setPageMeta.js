/**
 * Set page-specific meta description and title
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {boolean} isPublic - Whether this page should be indexed by search engines (default: false)
 */
export function setPageMeta(title, description, isPublic = false) {
  document.title = title;
  
  // Handle description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = description;
    document.head.appendChild(meta);
  }
  
  // Handle robots meta tag
  const metaRobots = document.querySelector('meta[name="robots"]');
  if (isPublic) {
    // Public pages: allow indexing, remove noindex if exists
    if (metaRobots) {
      const content = metaRobots.getAttribute('content');
      if (content && content.includes('noindex')) {
        metaRobots.setAttribute('content', content.replace(/noindex,?\s*/g, '').trim() || 'index, follow');
      }
    }
  } else {
    // Authenticated pages: prevent indexing
    if (metaRobots) {
      const content = metaRobots.getAttribute('content');
      if (!content || !content.includes('noindex')) {
        metaRobots.setAttribute('content', content ? 'noindex, ' + content : 'noindex, nofollow');
      }
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }
  }
}