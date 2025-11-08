import Image from "next/image";

const categories = [
  {
    title: "Pho & Aromatische Suppen",
    description:
      "Herzhafte Brühen mit zarten Zutaten – perfekt für kühle Münchner Tage.",
    image: "/images/bo-kho-goi-cuon.jpg",
    highlights: [
      {
        name: "Bò Kho",
        price: "15,50 €",
        detail:
          "Südvietnamesische Rinderbrühe mit Zitronengras, Karotten und Reisnudeln."
      },
      {
        name: "Saté-Suppe",
        price: "15,50 €",
        detail: "Kräftige Hühnerbrühe mit Erdnüssen, Pak Choi und Saté-Gewürz."
      },
      {
        name: "Vegetarische Pho",
        price: "14,50 €",
        detail: "Klare Brühe mit Tofu, Shiitake, Kräuterpilzen und frischen Kräutern."
      }
    ]
  },
  {
    title: "Frische Rollen & Salate",
    description:
      "Leichte Sommerrollen, duftende Kräuter und exotische Dressings.",
    image: "/images/goi-cuon.jpg",
    highlights: [
      {
        name: "Gỏi Cuốn Garnelen",
        price: "5,50 €",
        detail:
          "Sommerrollen mit Garnelen, Reisnudeln, Kräutern und Erdnuss-Hoisin."
      },
      {
        name: "Papayasalat Du Du Xanh",
        price: "11,90 €",
        detail: "Grüne Papaya, Minze, Basilikum, Erdnüsse und Chili-Fischsauce."
      },
      {
        name: "Mango-Salat mit Ente",
        price: "15,50 €",
        detail: "Fruchtige Mango trifft auf knusprige Ente und vietnamesische Kräuter."
      }
    ]
  },
  {
    title: "Bao, Gyoza & Street Food",
    description:
      "Knusprige Teigtaschen, fluffige Bao Buns und Fingerfood aus Saigon.",
    image: "/images/khai-vi-starter.jpg",
    highlights: [
      {
        name: "Bao mit knuspriger Ente",
        price: "8,00 €",
        detail: "Gedämpfte Buns mit Gurke, Pickles, Hoisin und Sesam."
      },
      {
        name: "Gyoza Mix",
        price: "8,00 €",
        detail:
          "Variation aus Huhn-, Gemüse- und Kimchi-Gyoza mit Soja-Dip."
      },
      {
        name: "Cha Gio Re",
        price: "6,50 €",
        detail:
          "Meeresfrüchte-Frühlingsrollen mit Garnelen, Krabben und Taro."
      }
    ]
  }
];

export function MenuPreview() {
  return (
    <section id="speisekarte" className="bg-brand-light/60 py-20 sm:py-28">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <div className="flex flex-col items-center text-center">
          <span className="badge bg-brand/10 text-brand">Unsere Klassiker</span>
          <h2 className="section-title mt-4">Ein Blick in unsere Speisekarte</h2>
          <p className="section-subtitle mt-4">
            Vietnamesische Delikatessen – frisch zubereitet in unserer Küche. Die
            komplette Tages- und Abendkarte erhalten Sie im Restaurant oder per
            telefonischer Bestellung.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.title}
              className="group flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 px-6 pb-8 pt-6">
                <h3 className="text-xl font-semibold text-brand">
                  {category.title}
                </h3>
                <p className="text-sm text-slate-600">{category.description}</p>
                <ul className="mt-4 space-y-4 text-sm text-slate-700">
                  {category.highlights.map((item) => (
                    <li key={item.name} className="border-l-4 border-brand/20 pl-4">
                      <div className="flex items-center justify-between gap-4 text-base font-semibold text-brand">
                        <span>{item.name}</span>
                        <span className="text-sm font-medium tracking-wide text-brand/80">
                          {item.price}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto text-xs uppercase tracking-[0.3em] text-brand/60">
                  Abendkarte exklusiv ab 17:30 Uhr im Restaurant
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 text-center text-sm text-slate-600 sm:flex-row sm:justify-center">
          <span className="font-semibold text-brand">
            Reservierung & Take-away: 089 28803451
          </span>
          <span className="hidden h-2 w-2 rounded-full bg-brand sm:inline-block" />
          <span>
            Frage gerne nach vegetarischen, veganen oder glutenfreien Varianten.
          </span>
        </div>
      </div>
    </section>
  );
}

