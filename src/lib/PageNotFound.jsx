import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}