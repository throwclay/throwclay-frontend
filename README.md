# Throw Clay - Pottery Studio Management Platform

A comprehensive pottery studio management platform with soft earth tones and minimalist design, built with Next.js.

## Migration from Vite to Next.js

This project has been successfully migrated from Vite to Next.js 14 using the App Router.

### Key Changes Made:

1. **Project Structure**
   - Created `app/` directory for Next.js App Router
   - Moved main application logic from `App.tsx` to `app/page.tsx`
   - Created `app/layout.tsx` for root layout and global styles
   - Extracted all TypeScript interfaces to `/types/index.ts`
   - Created `/utils/subscriptions.ts` for helper functions

2. **Configuration Files**
   - Added `next.config.js` for Next.js configuration
   - Updated `tsconfig.json` for Next.js compatibility
   - Created `package.json` with Next.js dependencies
   - Added `.gitignore` for Next.js projects

3. **Component Updates**
   - All components in `/components` directory remain unchanged
   - Updated imports to use `@/` alias (Next.js convention)
   - Made main page component a Client Component using `'use client'` directive

4. **Styling**
   - Global styles remain in `/styles/globals.css`
   - Tailwind CSS v4.0 configuration preserved
   - Design system with earth tones maintained

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

2. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

## Features

### Core Management Features
- **Kiln Management**: Track kiln schedules, loads, and firing processes
- **Member Management**: Manage studio members and their activities
- **Glaze Management**: Unified component with tabbed interface for all glazes, experiments, and photo gallery
- **Class Management**: Handle class schedules, attendance, and materials
- **Badge System**: Customizable achievement badges for students
- **Blog System**: Rich text editing with SEO optimization
- **Pottery Journal**: Track pottery projects with whiteboard features

### User Types
- **Studio Users**: Full access to management features, public website functionality
- **Artist Users**: Personal profiles, project tracking, class enrollment

### Design System
- **Colors**: Soft Ivory, Pale Sand, Gentle Taupe, Dark Charcoal, Muted Clay, Dusty Sage
- **Logo**: "Rounded Mound" minimalist design
- **Typography**: Custom font sizing and weights via CSS variables

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with global styles
│   └── page.tsx            # Main application page (Client Component)
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── figma/              # Figma integration components
│   └── [feature]/          # Feature-specific components
├── styles/
│   └── globals.css         # Global styles and design tokens
├── types/
│   └── index.ts            # TypeScript type definitions
├── utils/
│   └── subscriptions.ts    # Helper functions
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
\`\`\`

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)

## Documentation

- [Guidelines.md](./Guidelines.md) - Development guidelines
- [Attributions.md](./Attributions.md) - Third-party attributions

## Development Notes

- The application uses client-side routing with state management via React Context
- All components are designed to work with both Studio and Artist user types
- Mock data is used for development; replace with API calls for production
- The design system uses CSS variables defined in `globals.css`

## License

Private - All rights reserved
