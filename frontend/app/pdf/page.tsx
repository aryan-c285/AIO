import ToolCard from "@/components/ToolCard";

const PDF_TOOLS = [
  {
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining readable quality.",
    icon: "📦",
    href: "/pdf/compress",
  },
  {
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document.",
    icon: "📎",
    href: "/pdf/merge",
  },
  {
    title: "Split PDF",
    description: "Extract specific pages from a PDF into a new document.",
    icon: "✂️",
    href: "/pdf/split",
  },
  {
    title: "PDF to Word",
    description: "Convert your PDF documents to editable Word (.docx) files.",
    icon: "📝",
    href: "/pdf/to-word",
  },
  {
    title: "PDF to Excel",
    description: "Extract tables and data from PDFs into Excel spreadsheets.",
    icon: "📊",
    href: "/pdf/to-excel",
  },
];

export default function PdfHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          📄 PDF Tools
        </h1>
        <p className="mt-2 text-neutral-400">
          Everything you need to work with PDF files — compress, merge, split,
          and convert.
        </p>
      </div>

      <div className="stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PDF_TOOLS.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </div>
  );
}
