# BiteReserve

BiteReserve is a reservation request and demand-tracking platform for restaurants, designed to capture high-intent diners at the moment of decision.

## Overview

BiteReserve is **not** a destination site. It's a conversion tool that:
- Captures high-intent reservation requests
- Works with partner platforms like TopTours.ai
- Provides a simple, focused experience for travelers who know where they want to dine

## Features

- **Restaurant Pages**: Simple pages with restaurant info and reservation request forms
- **Homepage**: Clear explanation of what BiteReserve is and how it works
- **About Page**: Detailed information about BiteReserve and the 2xGen ecosystem
- **Destinations Page**: Light directory that links to TopTours.ai (navigation bridge only)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/` - Next.js app directory with pages
  - `page.tsx` - Homepage
  - `about/page.tsx` - About page
  - `destinations/page.tsx` - Destinations directory (links to TopTours.ai)
  - `restaurant/[slug]/page.tsx` - Dynamic restaurant pages with reservation forms
- `components/` - Reusable components
  - `Footer.tsx` - Footer component with links

## Key Principles

- **No browsing**: BiteReserve doesn't offer restaurant browsing, filtering, or comparisons
- **Conversion focus**: Every page is designed to capture high-intent diners
- **Partner integration**: Works seamlessly with TopTours.ai for discovery
- **Simple UX**: Minimal, focused experience for users who have already decided

## SEO Structure

- **Indexed**: Restaurant pages, homepage, about page
- **Not Indexed**: Browsing pages, destination navigation helpers, internal search

This keeps Google's understanding clean: BiteReserve = action pages, TopTours = discovery pages.
