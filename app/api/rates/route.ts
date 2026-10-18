import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const stripHtml = (value: unknown) => String(value ?? '').replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
const categoryName = (key: string) => { const normalized = key.toLowerCase(); if (normalized === 'gtopup' || normalized.includes('game')) return 'เกม'; if (normalized === 'mtopup') return 'เติมเงินมือถือ'; if (normalized.includes('card') || normalized.includes('cash')) return 'บัตรเงินสด'; return key; };
const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, ' ').trim();
const compareMeta = (name: string) => {
  const regions = Array.from(name.matchAll(/\(([^)]+)\)/g)).map(match => normalizeName(match[1])).filter(Boolean);
  const core = normalizeName(name.replace(/\([^)]*\)/g, ' ')).split(' ').filter(token => !['garena', 'reseller', 'server', 'official', 'topup', 'mobile', 'เติมเกม'].includes(token)).join(' ');
  return { core, regions };
};
const sameGame = (left: string, right: string) => {
  const a = compareMeta(left), b = compareMeta(right);
  if ((a.regions.length || b.regions.length) && a.regions.join('|') !== b.regions.join('|')) return false;
  return a.core === b.core || a.core.includes(b.core) || b.core.includes(a.core) || a.core.split(' ').filter(token => b.core.split(' ').includes(token)).length >= 2;
};
const packageNumbers = (description: string | null) => (description || '').toLowerCase().match(/\d+(?:\.\d+)?\s*(?:k|m|บาท|เพชร|gems?|coins?|uc|points?|เครดิต|ดาว|vp|cp)?/g)?.join(' ') || '';
type Group = { id:string; type:string; name:string; category:string; fee:number; minimumAmount:number|null; maximumAmount:number|null; refundable:boolean; packages:{price:number;originalPrice?:number;description:string|null;sku?:string}[]; provider:string };
async function loadWepay(): Promise<Group[]> { const response=await fetch('https://www.wepay.in.th/comp_export.php?json',{next:{revalidate:300}}); if(!response.ok)throw new Error('Wepay unavailable'); const raw=await response.json(),payload=raw?.data??raw,groups:Group[]=[]; Object.entries(payload||{}).forEach(([key,value]:[string,any])=>{if(!Array.isArray(value))return;value.forEach((company:any)=>{const name=company.company_name||company.name||company.product_name||company.title,denominations=Array.isArray(company.denomination)?company.denomination:[company],packages=denominations.filter((item:any)=>item.price!==undefined||item.amount!==undefined).map((item:any)=>({price:Number(item.price??item.amount),description:stripHtml(item.description)||null}));if(name&&packages.length)groups.push({id:`wepay-${company.company_id||key}-${normalizeName(name)}`,type:key,name,category:company.category||categoryName(key),fee:company.fee??0,minimumAmount:company.minimum_amount??null,maximumAmount:company.maximum_amount??null,refundable:company.refundable??false,packages,provider:'Wepay'});})}); return groups; }
async function load24PaySeller(): Promise<Group[]> { const response=await fetch('https://x.24payseller.com/products/list',{next:{revalidate:300}}); if(!response.ok)throw new Error('24Payseller unavailable'); const raw=await response.json(),list=Array.isArray(raw)?raw:raw?.data||raw?.products||raw?.items||[]; return list.filter((product:any)=>product?.name&&Array.isArray(product.items)).map((product:any)=>({id:`24payseller-${product.key||normalizeName(product.name)}`,type:'gtopup',category:'เกม',name:product.name,fee:0,minimumAmount:null,maximumAmount:null,refundable:false,packages:product.items.map((item:any)=>({price:Number(item.price),originalPrice:Number(item.originalPrice)||undefined,description:stripHtml(item.name)||null,sku:item.sku})),provider:'24Payseller'})); }
export async function GET(request:Request){
 const provider=new URL(request.url).searchParams.get('provider')||'Wepay';
 const [wepayResult,sellerResult]=await Promise.allSettled([loadWepay(),load24PaySeller()]);
 const wepay=wepayResult.status==='fulfilled'?wepayResult.value:[],seller=sellerResult.status==='fulfilled'?sellerResult.value:[],groups=provider==='24Payseller'?seller:wepay;
 const sellerByName=new Map(seller.map(group=>[normalizeName(group.name),group]));
 const comparisons=wepay.flatMap(group=>{
  const groupKey=normalizeName(group.name);
  const match=sellerByName.get(groupKey)||seller.find(item=>sameGame(group.name,item.name));
  if(!match)return [];
  const sellerByKey=new Map(match.packages.map(pkg=>[normalizeName(`${pkg.sku||''} ${pkg.description||''}`),pkg]));
  const packages=group.packages.map((pkg,index)=>{
   const pkgKey=normalizeName(`${pkg.sku||''} ${pkg.description||''}`);
   const other=(pkgKey ? sellerByKey.get(pkgKey) : undefined)||match.packages.find(item=>{
    const key=normalizeName(item.description||''), current=normalizeName(pkg.description||'');
    const itemNumbers=packageNumbers(item.description), currentNumbers=packageNumbers(pkg.description);
    return (pkg.sku && item.sku && pkg.sku.toLowerCase()===item.sku.toLowerCase()) || (key && current && key===current) || (itemNumbers && currentNumbers && itemNumbers===currentNumbers);
   });
   return other?{description:pkg.description||other.description||`แพ็กเกจ ${index+1}`,wepay:pkg.price,seller:other.price,difference:Number((other.price-pkg.price).toFixed(2))}:null;
  }).filter(Boolean);
  return packages.length?[{name:group.name,wepay:group,seller:match,packages}]:[];
 });
 const rates=groups.flatMap(group=>group.packages.map(pkg=>({name:group.name,category:group.category,price:`฿ ${pkg.price.toFixed(2)}`,value:pkg.description||'แพ็กเกจ',update:'ล่าสุด',provider:group.provider})));
 return NextResponse.json({provider,groups,rates,comparisons});
}
