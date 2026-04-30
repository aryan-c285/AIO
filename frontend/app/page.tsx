import ToolCard from "@/components/ToolCard";

const CATEGORIES = [
  {
    title: "PDF Tools",
    description:
      "Compress, merge, split, and convert your PDFs to Word or Excel in seconds.",
    icon: "📄",
    href: "/pdf",
  },
  {
    title: "Image Tools",
    description:
      "Resize, compress, convert formats, and remove backgrounds from images.",
    icon: "🖼️",
    href: "/image",
  },
  {
    title: "File Converters",
    description:
      "Convert Word documents to PDF and Excel spreadsheets to CSV instantly.",
    icon: "🔄",
    href: "/convert/word-to-pdf",
  },
  {
    title: "Developer Tools",
    description:
      "Generate QR codes and secure passwords with customisable options.",
    icon: "🛠️",
    href: "/tools/qr-generator",
  },
  {
    title: "Everyday Utilities",
    description:
      "Handy everyday tools like unit converters — length, weight, temperature and more.",
    icon: "⚡",
    href: "/tools/unit-converter",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="animate-fade-in-up text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          All-in-One{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Toolkit
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">
          Free, fast, and private — process your files entirely in your browser
          and server memory. Nothing is stored.
        </p>
      </div>

      {/* Category grid */}
      <div className="stagger mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <ToolCard key={cat.href} {...cat} />
        ))}
      </div>
    </div>
  );
}
