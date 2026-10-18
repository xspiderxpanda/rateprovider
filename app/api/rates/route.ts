import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const response = await fetch('https://www.wepay.in.th/comp_export.php?json', { next: { revalidate: 300 } });
    if (!response.ok) throw new Error('Wepay unavailable');
    const raw = await response.json();
    const payload = raw?.data ?? raw;
    const rates: any[] = [];
    const categoryName = (key: string) => key.toLowerCase().includes('game') ? 'เกม' : key.toLowerCase().includes('card') || key.toLowerCase().includes('cash') ? 'บัตรเงินสด' : 'เติมเงินมือถือ';
    Object.entries(payload || {}).forEach(([key, value]: [string, any]) => {
      if (!Array.isArray(value)) return;
      value.forEach((company: any) => {
        const name = company.company_name || company.name || company.product_name || company.title;
        const denominations = Array.isArray(company.denomination) ? company.denomination : [company];
        denominations.forEach((item: any) => {
          if (item.price === undefined && item.amount === undefined) return;
          rates.push({ name: name || 'สินค้า Wepay', category: company.category || categoryName(key), price: `฿ ${Number(item.price ?? item.amount).toFixed(2)}`, value: item.description || `${company.minimum_amount ?? ''}${company.maximum_amount ? ` - ${company.maximum_amount}` : ''}`.trim() || 'เติมเงินตามมูลค่า', update: 'ล่าสุด', companyId: company.company_id });
        });
      });
    });
    return NextResponse.json({ rates });
  } catch { return NextResponse.json({ rates: [] }, { status: 200 }); }
}
