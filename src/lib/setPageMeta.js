/**
 * Set page-specific meta description, title, and canonical URL
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {boolean} isPublic - Whether this page should be indexed by search engines (default: false)
 * @param {string} pagePath - URL path for canonical (e.g., '/pricing', '/onboarding'). Omit for current route.
 */
export function setPageMeta(title, description, isPublic = false, pagePath) {
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
    if (metaRobots) {
      const content = metaRobots.getAttribute('content');
      if (content && content.includes('noindex')) {
        metaRobots.setAttribute('content', content.replace(/noindex,?\s*/g, '').trim() || 'index, follow');
      }
    }
  } else {
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
  
  // Handle canonical URL
  const path = pagePath || window.location.pathname;
  const canonicalUrl = `https://tenurly.app${path === '/' ? '' : path}`;
  
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', canonicalUrl);
  } else {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
  }
}