
"use client";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="home-page">
      <h1>Welcome to My Website</h1>
      <button onClick={() => router.push('/dss')}>
        Enter DSS Application
      </button>
    </div>
  );
}