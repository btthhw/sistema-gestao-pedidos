import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(5)
  
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
  
  return Response.json({
    products: { data: products, error: productsError },
    categories: { data: categories, error: categoriesError }
  })
}
