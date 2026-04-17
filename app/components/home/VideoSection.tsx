import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
  videoId?: string
  ctaLabel: string
  ctaHref: string
}

export default function VideoSection({ title, subtitle, videoId, ctaLabel, ctaHref }: Props) {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Video embed or placeholder */}
        <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-custom mb-8" style={{ aspectRatio: '16/9' }}>
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-background">
              <div className="glow-orb w-48 h-48 bg-blue-600/10 top-0 left-1/3" />
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center relative z-10">
                <Play className="w-7 h-7 text-primary ml-1" />
              </div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  Video próximamente
                </span>
              </div>
            </div>
          )}
        </div>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:shadow-glow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {ctaLabel}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
