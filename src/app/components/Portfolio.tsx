import { useEffect, useState } from "react";

interface ArenaBlock {
  id: number;
  title: string;
  class: string;
  image?: {
    display: {
      url: string;
    };
    thumb: {
      url: string;
    };
  };
  source?: {
    url: string;
  };
  content?: string;
  description?: string;
}

interface ArenaChannel {
  title: string;
  contents: ArenaBlock[];
}

export function Portfolio() {
  const [channel, setChannel] = useState<ArenaChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.are.na/v2/channels/work-fvv8x5ph5_0")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch channel");
        return res.json();
      })
      .then((data) => {
        setChannel(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-[#333333]">Loading...</div>;
  }

  if (error) {
    return <div className="text-[#333333]">Error: {error}</div>;
  }

  if (!channel) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-12 text-[#333333]">{channel.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {channel.contents.map((block) => (
          <div key={block.id} className="group">
            {block.class === "Image" && block.image && (
              <a 
                href={block.source?.url || block.image.display.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={block.image.display.url}
                  alt={block.title || ""}
                  className="w-full h-auto mb-3 hover:opacity-90 transition-opacity"
                />
                {block.title && (
                  <p className="text-[#333333] text-sm">{block.title}</p>
                )}
              </a>
            )}
            
            {block.class === "Text" && block.content && (
              <div className="p-6 border border-[#333333]/20">
                <div 
                  className="text-[#333333] text-sm"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </div>
            )}
            
            {block.class === "Link" && (
              <a 
                href={block.source?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-6 border border-[#333333]/20 hover:border-[#333333] transition-colors"
              >
                {block.image && (
                  <img
                    src={block.image.thumb.url}
                    alt={block.title || ""}
                    className="w-full h-auto mb-3"
                  />
                )}
                <p className="text-[#333333] text-sm">{block.title || block.source?.url}</p>
              </a>
            )}
            
            {block.class === "Media" && block.image && (
              <div>
                <img
                  src={block.image.display.url}
                  alt={block.title || ""}
                  className="w-full h-auto mb-3"
                />
                {block.title && (
                  <p className="text-[#333333] text-sm">{block.title}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
