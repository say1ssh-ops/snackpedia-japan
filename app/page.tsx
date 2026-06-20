import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

type Maker = { id: number; name: string };
type Category = { id: number; name: string };

type Product = {
  id: number;
  name: string;
  release_year: number | null;
  discontinued: boolean;
  description: string | null;
  maker_id: number | null;
  category_id: number | null;
  image_url: string | null;
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    maker?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;

  const q = params?.q ?? "";
  const makerId = params?.maker ?? "";
  const categoryId = params?.category ?? "";

  const { data: makers } = await supabase.from("makers").select("id, name").order("id");
  const { data: categories } = await supabase.from("categories").select("id, name").order("id");

  let productQuery = supabase
    .from("products")
    .select("id, name, release_year, discontinued, description, maker_id, category_id, image_url")
    .order("id");

  if (q) {
    productQuery = productQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (makerId) {
    productQuery = productQuery.eq("maker_id", Number(makerId));
  }

  if (categoryId) {
    productQuery = productQuery.eq("category_id", Number(categoryId));
  }

  const { data: products } = await productQuery;

  return (
    <main style={{ minHeight: "100vh", padding: "40px", fontFamily: "sans-serif", background: "#fff7ed" }}>
      <section style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "8px" }}>🍟 日本スナック図鑑 v0.12</h1>

        <p style={{ fontSize: "18px", color: "#555" }}>
          選択中のメーカー・カテゴリーが色付きで表示されます。
        </p>

        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="例：カルビー、ポテトチップス、じゃがりこ"
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              margin: "28px 0",
            }}
          />

          {makerId && <input type="hidden" name="maker" value={makerId} />}
          {categoryId && <input type="hidden" name="category" value={categoryId} />}
        </form>

        <div style={{ marginBottom: "20px" }}>
          <Link href="/">すべて表示</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "18px" }}>
            <h2>メーカーから探す</h2>

            {makers?.map((maker) => {
              const selected = makerId === String(maker.id);

              return (
                <Link
                  key={maker.id}
                  href={`/?maker=${maker.id}${categoryId ? `&category=${categoryId}` : ""}`}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    marginBottom: "6px",
                    borderRadius: "10px",
                    border: selected ? "2px solid #f97316" : "1px solid #eee",
                    background: selected ? "#ffedd5" : "white",
                    fontWeight: selected ? "bold" : "normal",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {selected ? "🟠" : "🏭"} {maker.name}
                </Link>
              );
            })}
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "18px" }}>
            <h2>カテゴリーから探す</h2>

            {categories?.map((category) => {
              const selected = categoryId === String(category.id);

              return (
                <Link
                  key={category.id}
                  href={`/?category=${category.id}${makerId ? `&maker=${makerId}` : ""}`}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    marginBottom: "6px",
                    borderRadius: "10px",
                    border: selected ? "2px solid #f97316" : "1px solid #eee",
                    background: selected ? "#ffedd5" : "white",
                    fontWeight: selected ? "bold" : "normal",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {selected ? "🟠" : "🍿"} {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "24px", background: "white", padding: "24px", borderRadius: "18px" }}>
          <h2>商品一覧</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {products?.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ border: "1px solid #eee", borderRadius: "14px", padding: "16px" }}>
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={400}
                      height={300}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "12px",
                      }}
                    />
                  )}

                  <strong>{product.name}</strong>

                  <p style={{ margin: "8px 0", color: "#666" }}>
                    発売年：{product.release_year ?? "不明"}
                  </p>

                  <p style={{ margin: "8px 0", color: product.discontinued ? "#b91c1c" : "#166534" }}>
                    {product.discontinued ? "終売" : "販売中"}
                  </p>

                  <p style={{ color: "#555" }}>{product.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}