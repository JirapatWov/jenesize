import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">
          Affiliate Platform
        </h1>
        <p className="text-xl text-muted-foreground">
          Price comparison and affiliate link management for Lazada & Shopee
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <Button size="lg">Admin Login</Button>
          </Link>
          <Link href="/campaigns">
            <Button size="lg" variant="outline">View Campaigns</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

