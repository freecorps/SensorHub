# SensorHub

SensorHub is a Next.js application for managing and visualizing sensor data. It uses TypeScript, Supabase for backend services, Framer Motion for animations, and shadcn/ui for UI components.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building web applications
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Supabase](https://supabase.io/) - Open source Firebase alternative
- [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library for React
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS
- [Bun](https://bun.sh/) - All-in-one JavaScript runtime & toolkit

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- [Bun](https://bun.sh/) (for package management and running the dev server)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/freecorps/SensorHub.git
   cd sensorhub
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up your environment variables:
   Copy the `.env.example` file to `.env.local` and fill in your Supabase project details:

   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:

   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- User authentication and profile management
- Sensor creation and management
- Real-time sensor data visualization
- Public and private sensor options
- Sensor grouping functionality
- API key and password-based sensor data submission

## Supabase Setup

This project uses Supabase for backend services. The database schema and security policies are defined in the `tables.sql` file. Make sure to set up your Supabase project with these configurations.

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.io/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Bun Documentation](https://bun.sh/docs)

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Apache-2.0 license](https://choosealicense.com/licenses/apache-2.0/)
