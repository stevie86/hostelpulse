# Mobile-First Development Guide

This guide outlines best practices for implementing mobile-first development in the Hostelpulse project, leveraging Next.js 12 with Pages Router and styled-components for optimal mobile user experience.

## CSS Approach

### Mobile-First CSS Methodology

Adopt a mobile-first approach where styles are written for mobile devices first, then enhanced for larger screens using `min-width` media queries. This ensures the smallest screens receive the most optimized experience.

```css
/* Mobile-first: Base styles for mobile */
.component {
  font-size: 14px;
  padding: 8px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    font-size: 16px;
    padding: 12px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    font-size: 18px;
    padding: 16px;
  }
}
```

### Styled-Components Integration

Leverage styled-components' theme system for consistent breakpoints and responsive utilities:

```typescript
// In your theme file
export const theme = {
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },
};

// Usage in components
const ResponsiveContainer = styled.div`
  padding: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 24px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    padding: 32px;
  }
`;
```

### Touch-Friendly Design

- Minimum touch target size: 44px × 44px (Apple HIG)
- Adequate spacing between interactive elements
- Consider thumb-friendly zones for common actions

```typescript
const TouchButton = styled.button`
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  margin: 8px;
`;
```

## Next.js Specific Practices

### Viewport Meta Tag

Ensure proper viewport configuration in `_document.tsx`:

```typescript
// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
```

### Dynamic Imports for Mobile Components

Use Next.js dynamic imports to load mobile-specific components only when needed:

```typescript
import dynamic from 'next/dynamic';

const MobileNavigation = dynamic(() => import('../components/MobileNavigation'), {
  ssr: false, // Disable SSR for client-side only components
  loading: () => <div>Loading...</div>,
});
```

### Image Optimization

Leverage Next.js Image component with responsive srcsets:

```typescript
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Hero"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority // For above-the-fold images
/>;
```

## Responsive Design Techniques

### Fluid Typography

Use viewport units and clamp() for scalable typography:

```typescript
const FluidText = styled.p`
  font-size: clamp(14px, 4vw, 18px);
  line-height: 1.5;
`;
```

### Flexible Grid Systems

Implement CSS Grid or Flexbox for responsive layouts:

```typescript
const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
```

### Container Queries (Future-Proofing)

Prepare for container queries by using wrapper components:

```typescript
const CardContainer = styled.div`
  container-type: inline-size;
`;

const Card = styled.div`
  padding: 16px;

  @container (min-width: 400px) {
    padding: 24px;
  }
`;
```

### Mobile Navigation Patterns

Implement common mobile navigation patterns:

```typescript
const MobileMenu = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: white;
  transform: translateX(-100%);
  transition: transform 0.3s ease;

  &.open {
    transform: translateX(0);
  }
`;
```

## Performance Considerations

### Critical CSS

Inline critical CSS for above-the-fold content:

```typescript
// In _document.tsx or individual pages
<style
  dangerouslySetInnerHTML={{
    __html: `
    .hero { background: #f0f0f0; }
    .hero h1 { font-size: 24px; }
  `,
  }}
/>
```

### Lazy Loading

Implement lazy loading for below-the-fold content:

```typescript
import { useState, useRef, useEffect } from 'react';

const LazyComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible && <HeavyComponent />}</div>;
};
```

### Bundle Splitting

Use dynamic imports to split code for mobile-specific features:

```typescript
const MobileFeatures = dynamic(() => import('../components/MobileFeatures'), {
  loading: () => <div>Loading mobile features...</div>,
});
```

### Performance Monitoring

Monitor Core Web Vitals with tools like Lighthouse and Web Vitals library:

```typescript
// In _app.tsx
import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }, []);

  return <Component {...pageProps} />;
}
```

## Testing Mobile-First Implementation

### Responsive Testing Checklist

- [ ] Test on actual mobile devices
- [ ] Use browser dev tools device emulation
- [ ] Test touch interactions
- [ ] Verify accessibility with screen readers
- [ ] Check performance on 3G connections

### Automated Testing

```typescript
// Example test for responsive behavior
describe('ResponsiveGrid', () => {
  it('renders single column on mobile', () => {
    // Test implementation
  });

  it('renders multiple columns on desktop', () => {
    // Test implementation
  });
});
```

## Best Practices Summary

1. **Start Mobile**: Design and develop for mobile first
2. **Progressive Enhancement**: Add features for larger screens
3. **Performance First**: Optimize for mobile network conditions
4. **Touch-Friendly**: Ensure adequate touch targets and spacing
5. **Test Thoroughly**: Use real devices and automated testing
6. **Monitor Performance**: Track Core Web Vitals regularly

Following these practices ensures Hostelpulse delivers an excellent mobile experience while maintaining code maintainability and performance.
