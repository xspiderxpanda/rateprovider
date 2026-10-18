import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const response = await fetch('https://www.wepay.in.th/comp_export.php', { next: { revalidate: 300 } });
    if (!response.ok) throw new Error('Wepay unavailable');
    const raw = await response.json();
    const list = Array.isArray(raw) ? raw : (raw.data || raw.products || raw.items || []);
    const rates = list.map((item: any) => ({ name: item.name || item.product_name || item.title || 'สินค้า Wepay', category: item.category || item.type || 'เกม', price: `฿ ${(item.price || item.amount || '—').toString()}`, value: item.value || item.detail || item.description || '—', update: 'ล่าสุด' })).filter((r: any) => r.name !== 'สินค้า Wepay');
    return NextResponse.json({ rates });
  } catch { return NextResponse.json({ rates: [] }, { status: 200 }); }
}
