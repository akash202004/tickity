# Ticketr - Real-time Event Ticketing Platform

Ticketr is a modern, real-time event ticketing platform built with Next.js, Convex, Clerk, and Stripe Connect. It features a sophisticated queue system, real-time updates, secure payment processing, and a beautiful, responsive UI.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Setup Guides](#setup-guides)
- [Architecture](#architecture)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

### For Event Attendees

- 🎫 Real-time ticket availability tracking
- ⚡ Smart queuing system with position updates
- 🕒 Time-limited ticket offers
- 📱 Mobile-friendly ticket management
- 🔒 Secure payment processing with Stripe
- 📲 Digital tickets with QR codes
- 💸 Automatic refunds for cancelled events

### For Event Organizers

- 💰 Direct payments via Stripe Connect
- 📊 Real-time sales monitoring
- 🎯 Automated queue management
- 📈 Event analytics and tracking
- 🔄 Automatic ticket recycling
- 🎟️ Customizable ticket limits
- ❌ Event cancellation with automatic refunds
- 🔄 Bulk refund processing

### Technical Features

- 🚀 Real-time updates using Convex
- 👤 Authentication with Clerk
- 💳 Payment processing with Stripe Connect
- 🌐 Server-side and client-side rendering
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 📱 Responsive design
- 🛡️ Rate limiting for queue joins and purchases
- 🔒 Automated fraud prevention
- 🔔 Toast notifications for real-time feedback
- ✨ Beautiful, accessible components with shadcn/ui

### UI/UX Features

- 🎯 Instant feedback with toast notifications
- 🎨 Consistent design system using shadcn/ui
- ♿ Fully accessible components
- 🎭 Animated transitions and feedback
- 📱 Responsive design across all devices
- 🔄 Loading states and animations
- 💫 Micro-interactions for better engagement

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **Backend:** Convex
- **Authentication:** Clerk
- **Payments:** Stripe Connect

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Razorpay Account
- Clerk Account
- Convex Account

## Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ticketr

# Install dependencies
npm install

# Start the development server
npm run dev

# In a separate terminal, start Convex
npx convex dev
```

## Setup Guides

### Clerk

1. [Create a Clerk application](https://clerk.com/)
2. Configure authentication providers and redirect URLs
3. Add your Clerk keys to `.env.local`

### Convex

1. [Create a Convex account](https://convex.dev/)
2. Create a new project
3. Install Convex CLI: `npm install convex`
4. Initialize Convex: `npx convex init`
5. Add your deployment URL to `.env.local`
6. Start Convex dev server: `npx convex dev`

### Stripe

1. Create a Stripe account
2. Enable Stripe Connect
3. Set up webhook endpoints
4. Add your Stripe keys to `.env.local`

#### Stripe Webhooks for Local Development

1. Install Stripe CLI ([docs](https://stripe.com/docs/stripe-cli))
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Add the webhook secret to `.env.local`

### UI Components

1. Install shadcn/ui CLI: `npx shadcn-ui@latest init`
2. Add components: `npx shadcn-ui@latest add toast button card dialog`
3. Add toaster: `npx shadcn-ui@latest add toaster`

## Architecture

### Database Schema

- Events
- Tickets
- Waiting List
- Users

### Key Components

- Real-time queue management
- Rate limiting
- Automated offer expiration
- Payment processing
- User synchronization

## Usage

### Creating an Event

1. Sign up as an event organizer
2. Complete Stripe Connect onboarding
3. Create event with details and ticket quantity
4. Publish event

### Purchasing Tickets

1. Browse available events
2. Join queue for desired event
3. Receive ticket offer
4. Complete purchase within time limit
5. Access digital ticket with QR code

### Handling Refunds and Cancellations

1. Event organizers can cancel events from their dashboard
2. System automatically processes refunds for all ticket holders
3. Refund status can be tracked in user dashboard

### User Experience

#### Real-time Feedback

- Instant purchase confirmations
- Queue position updates
- Error notifications
- Success page
- Ticket status

#### Interactive Elements

- Animated buttons and cards
- Loading states
- Progress indicators
- Skeleton loaders
- Smooth transitions

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License.
