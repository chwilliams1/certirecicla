"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/calculadora", label: "Calculadora" },
  { href: "/materiales", label: "Materiales" },
  { href: "/blog", label: "Blog" },
  { href: "/precios", label: "Precios" },
];

interface PublicHeaderProps {
  activePage?: string;
}

export default function PublicHeader({ activePage }: PublicHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="CertiRecicla" width={36} height={36} className="animate-breathe" />
          <span className="font-serif text-xl font-bold text-sage-800">CertiRecicla</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                activePage === link.label
                  ? "text-sage-700 font-medium"
                  : "hover:text-sage-600 transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Iniciar sesión</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Prueba gratis</Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="sm:hidden">
            <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sage-800/60 hover:text-sage-800 transition-colors rounded-lg">
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-white pt-12">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                    activePage === link.label
                      ? "text-sage-700 font-medium bg-sage-50"
                      : "text-muted-foreground hover:text-sage-600 hover:bg-sage-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border/50 mt-4 pt-4 flex flex-col gap-2 px-4">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Iniciar sesión</Button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">Prueba gratis</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
