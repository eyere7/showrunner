import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/shows/1');
}
