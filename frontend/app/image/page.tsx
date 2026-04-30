import ToolCard from "@/components/ToolCard";

const IMAGE_TOOLS = [
  {
    title: "Resize Image",
    description: "Change the dimensions of your image to any custom size.",
    icon: "↔️",
    href: "/image/resize",
  },
  {
    title: "Compress Image",
    description: "Reduce image file size while maintaining visual quality.",
    icon: "📦",
    href: "/image/compress",
  },
  {
    title: "Convert Image",
    description: "Convert images between PNG, JPEG, WebP, BMP, and GIF formats.",
    icon: "🔄",
    href: "/image/convert",
  },
  {
    title: "Remove Background",
    description: "Remove white/light backgrounds from images automatically.",
    icon: "🎨",
    href: "/image/remove-bg",
  },
];

export default function ImageHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          🖼️ Image Tools
        </h1>
        <p className="mt-2 text-neutral-400">
          Resize, compress, convert, and edit your images instantly.
        </p>
      </div>

      <div className="stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {IMAGE_TOOLS.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </div>
  );
}
