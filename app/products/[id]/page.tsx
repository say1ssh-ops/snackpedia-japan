import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      makers(name),
      categories(name)
    `)
    .eq("id", id)
    .single();

  if (!product) {
    return <div>商品が見つかりません</div>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#fff7ed",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 8px 24px #00000012",
        }}
      >
        <Link href="/">← 一覧へ戻る</Link>

        <h1
          style={{
            marginTop: "24px",
            fontSize: "36px",
          }}
        >
          {product.name}
        </h1>

        <div
          style={{
            marginTop: "16px",
            lineHeight: 1.8,
          }}
        >
          <p>
            <strong>メーカー：</strong>
            {product.makers?.name ?? "-"}
          </p>

          <p>
            <strong>カテゴリー：</strong>
            {product.categories?.name ?? "-"}
          </p>

          <p>
            <strong>発売年：</strong>
            {product.release_year ?? "不明"}
          </p>

          <p>
            <strong>状態：</strong>
            {product.discontinued ? "🔴 終売" : "🟢 販売中"}
          </p>
        </div>

        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            background: "#fafafa",
            borderRadius: "12px",
          }}
        >
          <h2>商品説明</h2>
          <p>{product.description ?? "説明なし"}</p>
        </div>
      </div>
    </main>
  );
}