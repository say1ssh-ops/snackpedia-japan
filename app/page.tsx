import { supabase } from "@/lib/supabase";

type Maker = { id: number; name: string };
type Category = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  release_year: number | null;
  discontinued: boolean;
  description: string | null;
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params?.q ?? "";

  const { data: makers } = await supabase.from("makers").select("id, name").order("id");
  const { data: categories } = await supabase.from("categories").select("id, name").order("id");

  let productQuery = supabase
    .from("products")
    .select("id, name, release_year, discontinued, description")
    .order("id");

  if (q) {
    productQuery = productQuery.or(
      `name.ilike.%${q}%,description.ilike.%${q}%`
    );
  }

  const { data: products } = await productQuery;

  return (
    <main style={{ minHeight: "100vh", padding: "40px", fontFamily: "sans-serif", background: "#fff7ed" }}>
      <section style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "8px" }}>🍟 日本スナック図鑑 v0.5</h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          商品名・説明文から検索できます。
        </p>

        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="例：カルビー、ポテトチップス、じゃがりこ"
            style={{ width: "100%", padding: "16px", fontSize: "16px", borderRadius: "12px", border: "1px solid #ddd", margin: "28px 0" }}
          />
        </form>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "18px", boxShadow: "0 8px 24px #00000012" }}>
            <h2>メーカーから探す</h2>
            {makers?.map((maker) => (
              <div key={maker.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>🏭 {maker.name}</div>
            ))}
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "18px", boxShadow: "0 8px 24px #00000012" }}>
            <h2>カテゴリーから探す</h2>
            {categories?.map((category) => (
              <div key={category.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>🍿 {category.name}</div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "24px", background: "white", padding: "24px", borderRadius: "18px", boxShadow: "0 8px 24px #00000012" }}>
          <h2>商品一覧 {q ? `「${q}」の検索結果` : ""}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            {products?.map((product) => (
              <div key={product.id} style={{ border: "1px solid #eee", borderRadius: "14px", padding: "16px" }}>
                <strong>{product.name}</strong>
                <p style={{ margin: "8px 0", color: "#666" }}>発売年：{product.release_year ?? "不明"}</p>
                <p style={{ margin: "8px 0", color: product.discontinued ? "#b91c1c" : "#166534" }}>
                  {product.discontinued ? "終売" : "販売中"}
                </p>
                <p style={{ color: "#555" }}>{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}