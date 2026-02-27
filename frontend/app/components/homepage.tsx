export default function homepage() {
    const events = [
      {
        tag: "Tournament",
        title: "Inter-City Basketball Tournament",
        location: "Grand Arena, NY",
        date: "July 15-20, 2024",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvTHqQlx0a7Fje-3-1mUUgKeCEtutlWHtAfQ1cG_y_cCNPzg-XUh41alX7BgkFTvCi2EUDY0f6rIIe86s3p7bUdAfCbaMMjed0DDdqLCV4meiXz9cFuHmsAeqBz8Y9ybuGVumQC6gN-gwla4RDeOJTdxP-xELNz-TZZTbuN-ZdtMUmIvr2vWZG6jJfJZHVcOufHDPZi7FHw8Vm-bWvsDUwMocKZFmlU3rFGQIHdiWl0XktrvObs8JYr_PFE0s3TlXYiXtLJ0GfH6E",
      },
      {
        tag: "Tennis",
        title: "Summer Tennis Open",
        location: "Elite Courts, CA",
        date: "August 5-7, 2024",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDal-xYX-mAF7paS0kBIJ5wRF56Xo9TWFiQ_cWttG_e3tckzJAsOzvWqYSjdO_6fK5wky29QNx-6UegQoqSjUDXO8WBMMy2fzXlooEGKKi3sKFnHb0SZrYUVmEH1YDeFkckQMet674zw52v0ivDNBrb_tGa0wt3DtZ9UlnLAEUOI_ElBZ21UlOsn6-1z4hqekxKw5wf_zpCwhI5wqDNXQwZKREPsVN-U8tpUZHKor6Pasep6_qO14X-grreUROGW9SnkkRmJ9-Clk",
      },
      {
        tag: "Corporate",
        title: "Corporate Soccer League",
        location: "City Park Stadium, TX",
        date: "September 10, 2024",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOa_PyFs3EvUaap5glh5rIGfssuAoeRpIWdrZoUWK8rXrgQdz-XzK_htb9Dc3zsArcQe0acnS9K8Zlt_sKb0glKjg6xPuZ43uNmOKsIANRI7omWdWqYj0RHXOWGp1HLovbBui3nr6zau0QfEpVXfzYC01NDYs3-BLsI61QcFjV6uBcRWQQC2Qv0bGLgeM6VjPfNlxLsBXVdwBUtc9m0WMB3KOw-_prF0-aLVo7_xG2tox7MrrRFx_TE-yS4OGMCz5J73KgUihbVVo",
      },
    ] as const;
  
    const reviews = [
      {
        stars: 5,
        quote: "The booking management is flawless. We've seen a 40% increase in facility utilization since switching to Sportek.",
        initials: "JD",
        name: "James Dalton",
        role: "Arena Manager, NY",
        featured: false,
      },
      {
        stars: 5,
        quote: "Sportek has completely revolutionized how we handle our corporate leagues. The reporting tools are second to none.",
        initials: "SR",
        name: "Sarah Rodriguez",
        role: "Events Director",
        featured: true,
      },
      {
        stars: 4,
        quote: "Easy to use for both my staff and our clients. The customer support team is incredibly responsive and helpful.",
        initials: "MK",
        name: "Michael Kimm",
        role: "Club Owner",
        featured: false,
      },
    ] as const;
  
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
  
        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              {/*Span for logo*/}
              <h2 className="text-slate-900 dark:text-white text-2xl font-extrabold tracking-tight">Sportek</h2>
            </div>
  
            <nav className="hidden md:flex items-center gap-10">
              {["Events", "Sports Property", "Reviews", "About"].map((item) => (
                <a key={item} href="#"
                  className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-semibold"
                >
                  {item}
                </a>
              ))}
            </nav>
  
            <div className="flex items-center gap-4">
              <button className="px-5 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                Sign In
              </button>
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                Login
              </button>
            </div>
          </div>
        </header>
  
        <main className="flex-grow">
  
          {/* ── HERO ── */}
          <section className="relative w-full px-6 lg:px-10 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="relative min-h-[560px] flex flex-col items-start justify-center rounded-3xl overflow-hidden px-8 md:px-16 py-20 bg-primary/10">
                <div className="absolute inset-0 z-0">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDofGQdMBt412IyDgbydNvhP4QjXvTy_3s7us_fnkVKtCebPdZLzPAnCpcfGIDjRUsEvuRzgL3lUlGe0Z1WdScUxy4zYPAGxF-UwRcStKXhU3F8mGTt5uFdeXyarFq48XLvh9tEny_5EA94mt4uH2HqUSYzuB_HKbGc5Lj1t7QUEU87CYOMWrmnzC6TRUkrTUw8lVh26RY2SNP-5kx-Koa8ORjRa_qBG2JCZV3wT5VBiPqKnuPRPEM0cdaXdI5BDIRrnlJkZSLncYc"
                    alt="Group of diverse people playing sports in modern indoor facility"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />
                </div>
  
                <div className="relative z-10 max-w-2xl space-y-6">
                  <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
                    Manage Your Sports Empire with Sportek
                  </h1>
                  <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                    The ultimate sports property and booking management system designed for modern facilities and organizations. Empower your team and athletes today.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl">
                      Get Started Now
                    </button>
                    <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 px-8 py-4 rounded-xl text-lg font-bold transition-all">
                      View Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>


  
          {/* ── FEATURED EVENTS ── */}
          <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
            <div className="flex items-end justify-between mb-10">
              <div className="space-y-2">
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Explore Talent</span>
                <h2 className="text-3xl font-extrabold tracking-tight">Featured Events</h2>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold hover:underline">
                View All Events
                {/*Span for arrow */}
              </button>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(({ tag, title, location, date, img }) => (
                <div key={title} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={img}
                      alt={title}
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {tag}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{title}</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>



  
          {/* ── REVIEWS ── */}
          <section className="bg-primary/5 py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight">Trusted by Industry Leaders</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Hear from property managers and facility owners who transformed their operations with Sportek.
                </p>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map(({ stars, quote, initials, name, role, featured }) => (
                  <div key={name}
                    className={`p-8 rounded-2xl flex flex-col justify-between ${
                      featured
                        ? "bg-primary shadow-xl shadow-primary/20 text-white"
                        : "bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined"
                            style={{
                              fontVariationSettings: "'FILL' 1",
                              color: featured ? "white" : i < stars ? "#facc15" : "#cbd5e1",
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <p className={`italic leading-relaxed ${featured ? "text-white/90" : "text-slate-700 dark:text-slate-300"}`}>
                        &ldquo;{quote}&rdquo;
                      </p>
                    </div>
                    <div className="mt-8 flex items-center gap-4">
                      <div className={`size-12 rounded-full flex items-center justify-center font-bold ${
                        featured ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                      }`}>
                        {initials}
                      </div>
                      <div>
                        <h4 className={`font-bold ${featured ? "text-white" : "text-slate-900 dark:text-white"}`}>{name}</h4>
                        <p className={`text-xs ${featured ? "text-white/70" : "text-slate-500"}`}>{role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


  
              {/* Carousel indicators */}
              <div className="flex justify-center gap-2 mt-12">
                <div className="h-1.5 w-8 rounded-full bg-primary" />
                <div className="h-1.5 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="h-1.5 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
            </div>
          </section>
  
        </main>



  
        {/* ── FOOTER ── */}
        <footer className="bg-slate-900 text-white py-16 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                
                <h2 className="text-white text-2xl font-extrabold">Sportek</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Redefining sports management with intelligent booking and property management solutions.
              </p>
            </div>
  
            {[
              { heading: "Product", links: ["Features", "Pricing", "Case Studies", "Reviews"] },
              { heading: "Company", links: ["About Us", "Careers", "Contact", "Blog"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h5 className="font-bold mb-6">{heading}</h5>
                <ul className="space-y-4 text-slate-400 text-sm">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-primary transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
  
            <div>
              <h5 className="font-bold mb-6">Newsletter</h5>
              <p className="text-slate-400 text-sm mb-4">Stay updated with our latest features.</p>
              <div className="flex gap-2">
                <input
                  className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Your email"
                  type="email"
                />
                <button className="bg-primary px-4 py-2 rounded-lg material-symbols-outlined">
                  send
                </button>
              </div>
            </div>
          </div>
  
          <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-slate-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© 2024 Sportek Systems Inc. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((item) => (
                <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </footer>
  
      </div>
    );
  }