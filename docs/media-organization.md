# Media Organization Guidelines

This document outlines the structure and naming conventions for media files in the Surus website.

## Directory Structure

```
public/images/
├── brand/             # Company logos (main, variants)
├── investors/         # Investor logos
├── testimonials/      # Client testimonial photos
└── uploads/           # General media uploads (from CMS)
```

## Naming Conventions

### Brand Logos

```
brand/logo-main.png    # Primary logo
brand/logo-dark.png    # Dark background variant
brand/logo-light.png   # Light background variant
brand/logo-symbol.png  # Icon/symbol only
```

### Investor Logos

```
investors/[company-name].png
```

Example:
```
investors/castle-island.png
investors/plural.png
investors/protocol.png
```

### Testimonial Images

```
testimonials/[person-name].png
```

Example:
```
testimonials/john-smith.png
testimonials/jane-doe.png
```

## How to Add New Images

1. **Prepare your image files** with appropriate names following the conventions above
2. **Add files to the appropriate directory** in your local repository:
   ```
   /Users/surusklr/Desktop/surus-website/public/images/[directory]/
   ```
3. **Commit and push** the files to GitHub:
   ```
   git add public/images/[directory]/[file]
   git commit -m "Add [description] image"
   git push origin main
   ```

## Using Images in Code

### React Components

```tsx
// Brand logo in header
<img src="/images/brand/logo-main.png" alt="Surus" className="logo-image" />

// Investor logo
<img src="/images/investors/castle-island.png" alt="Castle Island Ventures" className="investor-logo" />

// Testimonial photo
<img src="/images/testimonials/john-smith.png" alt="John Smith" className="testimonial-photo" />
```

## Best Practices

1. **Use consistent dimensions** for each category of images
2. **Optimize image files** before adding them to the repository
3. **Use descriptive filenames** that clearly identify the content
4. **Keep file sizes small** to improve website performance
5. **Use PNG for logos** and other graphics with transparency
6. **Use JPG for photographs** where transparency is not needed

## Maintenance

Periodically review the image directories to:
1. Remove unused images
2. Update outdated logos or photos
3. Ensure naming conventions are followed

This structure follows the KISS principle while maintaining organization and predictability, making it easy for team members to find and use media assets.
