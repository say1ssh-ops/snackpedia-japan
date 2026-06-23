import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Maker = { id: number; name: string };
type Category = { id: number; name: string };

type RelatedName = { name: string } | { name: string }[] | null;

type Product = {
  id: number;
  name: string;
  release_year: number | null;
  discontinued: boolean;
  description: string | null;
  maker_id: number | null;
  category_id: number | null;
  makers: RelatedName;
  categories: RelatedName;
};

function getRelatedName(value: RelatedName) {
  if (!value) return "-";
  if (Array.isArray(value)) return value[0]?.name ?? "-";
  return value.name ?? "-";
}

function buildQuery(params: {
  q?: string;
  maker?: string;
  category?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.maker) searchParams.set("maker", params.maker);
  if (params.category) searchParams.set("category", params.category);

  const query = searchParams.toString();
  return query ? `/?${query}` : "/";
}

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

  const { data: makers } = await supabase
    .from("makers")
    .select("id, name")
    .order("id");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("id");

  let productQuery = supabase
    .from("products")
    .select(`
      id,
      name,
      release_year,
      discontinued,
      description,
      maker_id,
      category_id,
      makers(name),
      categories(name)
    `)
    .order("id");

  if (q) {
    productQuery = productQuery.or(
      `name.ilike.%${q}%,description.ilike.%${q}%`
    );
  }

  if (makerId) {
    productQuery = productQuery.eq("maker_id", Number(makerId));
  }

  if (categoryId) {
    productQuery = productQuery.eq("category_id", Number(categoryId));
  }

  const { data: products } = await productQuery;
  const productCount = products?.length ?? 0;

  const selectedMaker = makers?.find((maker) => makerId === String(maker.id));
  const selectedCategory = categories?.find(
    (category) => categoryId === String(category.id)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px",
        fontFamily: "sans-serif",
        color: "#111827",
        background:
          "radial-gradient(circle at top left, #fde68a 0, transparent 260px), radial-gradient(circle at top right, #fecaca 0, transparent 300px), linear-gradient(135deg, #fff7ed 0%, #fef3c7 46%, #fee2e2 100%)",
      }}
    >
      <section style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "34px",
            padding: "34px",
            border: "4px solid #fed7aa",
            boxShadow: "0 18px 40px #00000018",
            position: "relative",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-70px",
              right: "-70px",
              width: "190px",
              height: "190px",
              borderRadius: "999px",
              background: "#f97316",
              opacity: 0.16,
            }}
          />

          <div
            style={{
              display: "inline-block",
              background: "#ffedd5",
              color: "#c2410c",
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: "bold",
              border: "2px solid #fdba74",
              marginBottom: "14px",
            }}
          >
            🍟 Snackpedia Japan
          </div>

          <h1
            style={{
              fontSize: "48px",
              lineHeight: 1.1,
              margin: "0 0 12px",
              letterSpacing: "-0.04em",
              color: "#111827",
            }}
          >
            日本スナック図鑑
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#4b5563",
              margin: "0 0 24px",
              lineHeight: 1.8,
              maxWidth: "720px",
            }}
          >
            日本のスナック菓子を、メーカー・カテゴリー・商品名からサクッと探せるデータベースです。
          </p>

          <form>
            <input
              name="q"
              defaultValue={q}
              placeholder="例：カルビー、ポテトチップス、じゃがりこ"
              style={{
                width: "100%",
                padding: "18px 20px",
                fontSize: "17px",
                borderRadius: "999px",
                border: "3px solid #fdba74",
                background: "#fff7ed",
                color: "#111827",
                outline: "none",
                boxShadow: "0 8px 0 #fed7aa",
              }}
            />

            {makerId && <input type="hidden" name="maker" value={makerId} />}
            {categoryId && (
              <input type="hidden" name="category" value={categoryId} />
            )}
          </form>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "24px",
              alignItems: "center",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 16px",
                borderRadius: "999px",
                background: "#111827",
                color: "white",
                textDecoration: "none",
                fontWeight: "bold",
                boxShadow: "0 6px 0 #374151",
              }}
            >
              すべて表示
            </Link>

            {selectedMaker && (
              <span
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "#ecfeff",
                  color: "#0e7490",
                  fontWeight: "bold",
                  border: "2px solid #a5f3fc",
                }}
              >
                🏭 {selectedMaker.name}
              </span>
            )}

            {selectedCategory && (
              <span
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "#fef9c3",
                  color: "#854d0e",
                  fontWeight: "bold",
                  border: "2px solid #fde68a",
                }}
              >
                🍿 {selectedCategory.name}
              </span>
            )}

            <span
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: "999px",
                background: "#f0fdf4",
                color: "#166534",
                fontWeight: "bold",
                border: "2px solid #bbf7d0",
              }}
            >
              📦 {productCount}件表示中
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "28px",
              border: "3px solid #bfdbfe",
              boxShadow: "0 14px 30px #00000012",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "16px",
                color: "#1e3a8a",
              }}
            >
              🏭 メーカーから探す
            </h2>

            {makers?.map((maker: Maker) => {
              const selected = makerId === String(maker.id);

              return (
                <Link
                  key={maker.id}
                  href={buildQuery({
                    q,
                    maker: selected ? "" : String(maker.id),
                    category: categoryId,
                  })}
                  style={{
                    display: "block",
                    padding: "12px 14px",
                    marginBottom: "8px",
                    borderRadius: "16px",
                    border: selected ? "3px solid #f97316" : "2px solid #dbeafe",
                    background: selected ? "#ffedd5" : "#eff6ff",
                    fontWeight: selected ? "bold" : "normal",
                    textDecoration: "none",
                    color: selected ? "#c2410c" : "#1e40af",
                    boxShadow: selected ? "0 5px 0 #fdba74" : "0 4px 0 #bfdbfe",
                  }}
                >
                  {selected ? "🟠" : "🏭"} {maker.name}
                </Link>
              );
            })}
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "28px",
              border: "3px solid #fde68a",
              boxShadow: "0 14px 30px #00000012",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "16px",
                color: "#854d0e",
              }}
            >
              🍿 カテゴリーから探す
            </h2>

            {categories?.map((category: Category) => {
              const selected = categoryId === String(category.id);

              return (
                <Link
                  key={category.id}
                  href={buildQuery({
                    q,
                    maker: makerId,
                    category: selected ? "" : String(category.id),
                  })}
                  style={{
                    display: "block",
                    padding: "12px 14px",
                    marginBottom: "8px",
                    borderRadius: "16px",
                    border: selected ? "3px solid #f97316" : "2px solid #fde68a",
                    background: selected ? "#ffedd5" : "#fefce8",
                    fontWeight: selected ? "bold" : "normal",
                    textDecoration: "none",
                    color: selected ? "#c2410c" : "#854d0e",
                    boxShadow: selected ? "0 5px 0 #fdba74" : "0 4px 0 #fde68a",
                  }}
                >
                  {selected ? "🟠" : "🍿"} {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "28px",
            borderRadius: "30px",
            border: "4px solid #fecaca",
            boxShadow: "0 18px 40px #00000014",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#991b1b",
                fontSize: "28px",
              }}
            >
              📚 商品一覧
            </h2>

            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                fontWeight: "bold",
                padding: "8px 14px",
                borderRadius: "999px",
                border: "2px solid #fecaca",
              }}
            >
              {productCount} snacks
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {(products as Product[] | null)?.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    border: "3px solid #fed7aa",
                    borderRadius: "24px",
                    padding: "18px",
                    height: "100%",
                    background:
                      "linear-gradient(180deg, #ffffff 0%, #fff7ed 100%)",
                    boxShadow: "0 8px 0 #fed7aa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "12px",
                        color: "#0e7490",
                        background: "#ecfeff",
                        border: "1px solid #a5f3fc",
                        padding: "5px 8px",
                        borderRadius: "999px",
                        fontWeight: "bold",
                      }}
                    >
                      🏭 {getRelatedName(product.makers)}
                    </span>

                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "12px",
                        color: "#854d0e",
                        background: "#fef9c3",
                        border: "1px solid #fde68a",
                        padding: "5px 8px",
                        borderRadius: "999px",
                        fontWeight: "bold",
                      }}
                    >
                      🍿 {getRelatedName(product.categories)}
                    </span>
                  </div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "18px",
                      lineHeight: 1.5,
                      color: "#111827",
                    }}
                  >
                    {product.name}
                  </strong>

                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#6b7280",
                      fontWeight: "bold",
                    }}
                  >
                    📅 発売年：{product.release_year ?? "不明"}
                  </p>

                  <p
                    style={{
                      display: "inline-block",
                      margin: "10px 0 0",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      color: product.discontinued ? "#991b1b" : "#166534",
                      background: product.discontinued ? "#fee2e2" : "#dcfce7",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {product.discontinued ? "🔴 終売" : "🟢 販売中"}
                  </p>

                  <p
                    style={{
                      color: "#4b5563",
                      lineHeight: 1.7,
                      marginBottom: 0,
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}