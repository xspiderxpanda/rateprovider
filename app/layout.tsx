import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RateHub — เช็คราคาเกมและบัตรเงินสด',
  description: 'รวมเรทเติมเกม เติมเงินมือถือ และบัตรเงินสดจากผู้ให้บริการที่คุณเลือก',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="th"><body>{children}</body></html>;
}
