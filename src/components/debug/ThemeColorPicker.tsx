
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface HSLColor {
  h: string;
  s: string;
  l: string;
}

interface ColorVariable {
  label: string;
  cssVar: string;
}

const THEME_COLOR_VARIABLES: ColorVariable[] = [
  { label: "Fons (Background)", cssVar: "--background" },
  { label: "Text Principal (Foreground)", cssVar: "--foreground" },
  { label: "Fons Targetes (Card)", cssVar: "--card" },
  { label: "Text Targetes (Card Foreground)", cssVar: "--card-foreground" },
  { label: "Fons Popover", cssVar: "--popover" },
  { label: "Text Popover", cssVar: "--popover-foreground" },
  { label: "Color Primari", cssVar: "--primary" },
  { label: "Text sobre Primari", cssVar: "--primary-foreground" },
  { label: "Color Secundari", cssVar: "--secondary" },
  { label: "Text sobre Secundari", cssVar: "--secondary-foreground" },
  { label: "Silenciat (Muted)", cssVar: "--muted" },
  { label: "Text Silenciat (Muted Foreground)", cssVar: "--muted-foreground" },
  { label: "Accent", cssVar: "--accent" },
  { label: "Text sobre Accent", cssVar: "--accent-foreground" },
  { label: "Destructiu (Errors)", cssVar: "--destructive" },
  { label: "Text sobre Destructiu", cssVar: "--destructive-foreground" },
  { label: "Vores (Border)", cssVar: "--border" },
  { label: "Fons Camps d'Entrada (Input)", cssVar: "--input" },
  { label: "Indicador de Focus (Ring)", cssVar: "--ring" },
  // Variables del Sidebar
  { label: "Sidebar: Fons", cssVar: "--sidebar-background" },
  { label: "Sidebar: Text Principal", cssVar: "--sidebar-foreground" },
  { label: "Sidebar: Color Primari", cssVar: "--sidebar-primary" },
  { label: "Sidebar: Text sobre Primari", cssVar: "--sidebar-primary-foreground" },
  { label: "Sidebar: Accent", cssVar: "--sidebar-accent" },
  { label: "Sidebar: Text sobre Accent", cssVar: "--sidebar-accent-foreground" },
  { label: "Sidebar: Vores", cssVar: "--sidebar-border" },
  { label: "Sidebar: Indicador de Focus", cssVar: "--sidebar-ring" },
];

// Funció per parsejar valors HSL
const parseHslString = (hslString: string): HSLColor | null => {
  const parts = hslString.trim().split(/\s+/);
  if (parts.length === 3) {
    return { h: parts[0], s: parts[1].replace('%', ''), l: parts[2].replace('%', '') };
  }
  return null;
};

// Aquests valors HAN DE COINCIDIR amb :root a globals.css (Paleta Oceà Profund per defecte)
const defaultColorsFromCSS: Record<string, string> = {
    "--background": "200 50% 96%",
    "--foreground": "210 40% 15%",
    "--card": "200 40% 99%",
    "--card-foreground": "210 40% 15%",
    "--popover": "200 40% 99%",
    "--popover-foreground": "210 40% 15%",
    "--primary": "210 70% 45%",
    "--primary-foreground": "210 20% 95%",
    "--secondary": "190 60% 88%",
    "--secondary-foreground": "190 30% 25%",
    "--muted": "200 30% 93%",
    "--muted-foreground": "200 20% 50%",
    "--accent": "220 20% 60%", 
    "--accent-foreground": "220 15% 20%", // UPDATED
    "--destructive": "0 70% 50%",
    "--destructive-foreground": "0 0% 98%",
    "--border": "200 30% 85%",
    "--input": "200 30% 90%",
    "--ring": "210 70% 55%",
    "--sidebar-background": "220 30% 25%",
    "--sidebar-foreground": "200 30% 85%",
    "--sidebar-primary": "195 60% 50%", 
    "--sidebar-primary-foreground": "195 15% 95%",
    "--sidebar-accent": "220 20% 35%", 
    "--sidebar-accent-foreground": "200 40% 90%",
    "--sidebar-border": "220 20% 30%",
    "--sidebar-ring": "195 60% 60%",
};


interface PaletteDefinition {
  name: string;
  colors: Record<string, string>; // cssVar -> "H S% L%"
}

const PREDEFINED_PALETTES: PaletteDefinition[] = [
  {
    name: "Oceà Profund (Defecte App)",
    colors: {
      "--background": "200 50% 96%", "--foreground": "210 40% 15%",
      "--card": "200 40% 99%", "--card-foreground": "210 40% 15%",
      "--popover": "200 40% 99%", "--popover-foreground": "210 40% 15%",
      "--primary": "210 70% 45%", "--primary-foreground": "210 20% 95%",
      "--secondary": "190 60% 88%", "--secondary-foreground": "190 30% 25%",
      "--muted": "200 30% 93%", "--muted-foreground": "200 20% 50%",
      "--accent": "220 20% 60%", "--accent-foreground": "220 15% 20%", // UPDATED ACCENT & FOREGROUND
      "--destructive": "0 70% 50%", "--destructive-foreground": "0 0% 98%",
      "--border": "200 30% 85%", "--input": "200 30% 90%", "--ring": "210 70% 55%",
      "--sidebar-background": "220 30% 25%", "--sidebar-foreground": "200 30% 85%",
      "--sidebar-primary": "195 60% 50%", "--sidebar-primary-foreground": "195 15% 95%",
      "--sidebar-accent": "220 20% 35%", "--sidebar-accent-foreground": "200 40% 90%",
      "--sidebar-border": "220 20% 30%", "--sidebar-ring": "195 60% 60%",
    },
  },
  {
    name: "Verd Gestió Àgil",
    colors: {
      "--background": "120 100% 97%", "--foreground": "120 25% 25%",
      "--card": "120 60% 99%", "--card-foreground": "120 25% 25%",
      "--popover": "120 60% 99%", "--popover-foreground": "120 25% 25%",
      "--primary": "120 60% 45%", "--primary-foreground": "120 25% 95%",
      "--secondary": "120 30% 90%", "--secondary-foreground": "120 40% 30%",
      "--muted": "120 20% 92%", "--muted-foreground": "120 15% 50%",
      "--accent": "80 100% 50%", "--accent-foreground": "80 100% 10%",
      "--destructive": "0 70% 50%", "--destructive-foreground": "0 0% 98%",
      "--border": "120 20% 88%", "--input": "120 20% 92%", "--ring": "120 60% 55%",
      "--sidebar-background": "120 30% 94%", "--sidebar-foreground": "120 25% 30%",
      "--sidebar-primary": "120 60% 40%", "--sidebar-primary-foreground": "120 25% 95%",
      "--sidebar-accent": "120 40% 88%", "--sidebar-accent-foreground": "120 25% 20%",
      "--sidebar-border": "120 20% 85%", "--sidebar-ring": "120 60% 50%",
    },
  },
  {
    name: "Blau Corporatiu Fred",
    colors: {
      "--background": "210 60% 97%", "--foreground": "210 30% 20%",
      "--card": "210 50% 99%", "--card-foreground": "210 30% 20%",
      "--popover": "210 50% 99%", "--popover-foreground": "210 30% 20%",
      "--primary": "220 70% 50%", "--primary-foreground": "220 20% 95%",
      "--secondary": "200 50% 90%", "--secondary-foreground": "200 40% 30%",
      "--muted": "210 30% 92%", "--muted-foreground": "210 20% 55%",
      "--accent": "190 80% 60%", "--accent-foreground": "190 25% 15%",
      "--destructive": "0 70% 55%", "--destructive-foreground": "0 0% 98%",
      "--border": "210 30% 88%", "--input": "210 30% 94%", "--ring": "220 70% 60%",
      "--sidebar-background": "210 40% 92%", "--sidebar-foreground": "210 25% 25%",
      "--sidebar-primary": "220 65% 45%", "--sidebar-primary-foreground": "220 20% 96%",
      "--sidebar-accent": "200 50% 85%", "--sidebar-accent-foreground": "200 30% 15%",
      "--sidebar-border": "210 30% 80%", "--sidebar-ring": "220 65% 55%",
    },
  },
  {
    name: "Gris Modern Fosc",
    colors: {
      "--background": "220 10% 15%", "--foreground": "220 10% 85%",
      "--card": "220 10% 20%", "--card-foreground": "220 10% 85%",
      "--popover": "220 10% 20%", "--popover-foreground": "220 10% 85%",
      "--primary": "180 60% 50%", "--primary-foreground": "180 20% 10%",
      "--secondary": "220 10% 30%", "--secondary-foreground": "220 10% 75%",
      "--muted": "220 5% 25%", "--muted-foreground": "220 5% 60%",
      "--accent": "45 100% 55%", "--accent-foreground": "45 100% 10%",
      "--destructive": "0 60% 50%", "--destructive-foreground": "0 0% 98%",
      "--border": "220 10% 30%", "--input": "220 10% 25%", "--ring": "180 60% 60%",
      "--sidebar-background": "220 8% 12%", "--sidebar-foreground": "220 10% 80%",
      "--sidebar-primary": "180 55% 45%", "--sidebar-primary-foreground": "180 15% 5%",
      "--sidebar-accent": "220 10% 28%", "--sidebar-accent-foreground": "220 10% 90%",
      "--sidebar-border": "220 10% 28%", "--sidebar-ring": "180 55% 55%",
    },
  },
  {
    name: "Bosc Tardoral",
    colors: {
      "--background": "30 40% 95%", "--foreground": "25 30% 20%", 
      "--card": "30 30% 98%", "--card-foreground": "25 30% 20%",
      "--popover": "30 30% 98%", "--popover-foreground": "25 30% 20%",
      "--primary": "15 70% 48%", "--primary-foreground": "15 20% 96%", 
      "--secondary": "40 50% 88%", "--secondary-foreground": "40 30% 30%", 
      "--muted": "35 25% 92%", "--muted-foreground": "35 15% 55%",
      "--accent": "90 40% 50%", "--accent-foreground": "90 20% 10%", 
      "--destructive": "0 60% 50%", "--destructive-foreground": "0 0% 98%",
      "--border": "30 20% 85%", "--input": "30 20% 90%", "--ring": "15 70% 58%",
      "--sidebar-background": "20 25% 30%", "--sidebar-foreground": "30 30% 80%", 
      "--sidebar-primary": "10 60% 40%", "--sidebar-primary-foreground": "10 15% 92%", 
      "--sidebar-accent": "25 15% 40%", "--sidebar-accent-foreground": "30 35% 85%",
      "--sidebar-border": "20 15% 35%", "--sidebar-ring": "10 60% 50%",
    },
  },
  {
    name: "Gris Elegant (Botons Negres)",
    colors: {
      "--background": "0 0% 95%",
      "--foreground": "0 0% 20%",
      "--card": "0 0% 98%",
      "--card-foreground": "0 0% 20%",
      "--popover": "0 0% 98%",
      "--popover-foreground": "0 0% 20%",
      "--primary": "0 0% 10%", 
      "--primary-foreground": "0 0% 95%", 
      "--secondary": "0 0% 88%", 
      "--secondary-foreground": "0 0% 25%", 
      "--muted": "0 0% 92%", 
      "--muted-foreground": "0 0% 50%", 
      "--accent": "45 90% 55%", 
      "--accent-foreground": "45 100% 10%", 
      "--destructive": "0 70% 50%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "0 0% 85%", 
      "--input": "0 0% 96%", 
      "--ring": "45 90% 60%", 
      "--sidebar-background": "0 0% 25%", 
      "--sidebar-foreground": "0 0% 85%", 
      "--sidebar-primary": "0 0% 10%", 
      "--sidebar-primary-foreground": "0 0% 95%",
      "--sidebar-accent": "0 0% 35%", 
      "--sidebar-accent-foreground": "0 0% 90%",
      "--sidebar-border": "0 0% 30%",
      "--sidebar-ring": "45 90% 60%",
    },
  },
];


interface ColorControllerProps {
  label: string;
  cssVar: string;
  hsl: HSLColor;
  onColorChange: (cssVar: string, newHsl: HSLColor) => void;
}

const ColorController: React.FC<ColorControllerProps> = ({ label, cssVar, hsl, onColorChange }) => {
  const handleInputChange = (part: keyof HSLColor, value: string) => {
    onColorChange(cssVar, { ...hsl, [part]: value });
  };

  return (
    <div className="space-y-2 border p-3 rounded-md shadow-sm bg-card/50">
      <Label className="font-semibold text-sm">{label} <code className="text-xs text-muted-foreground">({cssVar})</code></Label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor={`${cssVar}-h`} className="text-xs">H</Label>
          <Input id={`${cssVar}-h`} type="number" value={hsl.h} onChange={(e) => handleInputChange('h', e.target.value)} placeholder="0-360" className="h-8 text-sm" />
        </div>
        <div>
          <Label htmlFor={`${cssVar}-s`} className="text-xs">S%</Label>
          <Input id={`${cssVar}-s`} type="number" value={hsl.s} onChange={(e) => handleInputChange('s', e.target.value)} placeholder="0-100" className="h-8 text-sm" />
        </div>
        <div>
          <Label htmlFor={`${cssVar}-l`} className="text-xs">L%</Label>
          <Input id={`${cssVar}-l`} type="number" value={hsl.l} onChange={(e) => handleInputChange('l', e.target.value)} placeholder="0-100" className="h-8 text-sm" />
        </div>
      </div>
    </div>
  );
};

export function ThemeColorPicker() {
  const [currentColors, setCurrentColors] = useState<Record<string, HSLColor>>({});
  const [isPaletteComboboxOpen, setIsPaletteComboboxOpen] = useState(false);
  const [selectedPaletteName, setSelectedPaletteName] = useState<string>(PREDEFINED_PALETTES[0].name);

  // Llegeix els colors inicials de les CSS variables
  useEffect(() => {
    const initialColors: Record<string, HSLColor> = {};
    if (typeof window !== 'undefined') {
      const rootStyle = getComputedStyle(document.documentElement);
      THEME_COLOR_VARIABLES.forEach(variable => {
        const cssValue = rootStyle.getPropertyValue(variable.cssVar).trim();
        const parsedHsl = parseHslString(cssValue || defaultColorsFromCSS[variable.cssVar]);
        if (parsedHsl) {
          initialColors[variable.cssVar] = parsedHsl;
        } else {
            const fallbackHsl = parseHslString(defaultColorsFromCSS[variable.cssVar] || "0 0% 0%");
            initialColors[variable.cssVar] = fallbackHsl || {h:'0', s:'0', l:'0'};
        }
      });
    }
    setCurrentColors(initialColors);
  }, []);

  // Aplica els colors a les CSS variables quan currentColors canvia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Object.entries(currentColors).forEach(([cssVar, hsl]) => {
        if (hsl && hsl.h && hsl.s && hsl.l) {
          document.documentElement.style.setProperty(cssVar, `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        }
      });
    }
  }, [currentColors]);

  const handleColorChange = useCallback((cssVar: string, newHsl: HSLColor) => {
    setCurrentColors(prevColors => ({
      ...prevColors,
      [cssVar]: newHsl,
    }));
    if (selectedPaletteName !== "Personalitzada") {
        setSelectedPaletteName("Personalitzada");
    }
  }, [selectedPaletteName]);

  const applyPalette = (palette: PaletteDefinition) => {
    const newColorsState: Record<string, HSLColor> = {};
    // Ensure all variables from THEME_COLOR_VARIABLES are set, using palette or default
    THEME_COLOR_VARIABLES.forEach(v => {
      const hslString = palette.colors[v.cssVar] || defaultColorsFromCSS[v.cssVar];
      const parsed = parseHslString(hslString);
      if (parsed) {
        newColorsState[v.cssVar] = parsed;
      } else {
        // Fallback if parsing fails for some reason (should not happen with defaults)
        newColorsState[v.cssVar] = { h: '0', s: '0', l: '0' };
      }
    });
    
    setCurrentColors(newColorsState);
    setSelectedPaletteName(palette.name);
    setIsPaletteComboboxOpen(false);
  };

  return (
    <Card className="mt-8 shadow-lg border-dashed border-destructive/50">
      <CardHeader>
        <CardTitle>🎨 Selector de Tema (Temporal)</CardTitle>
        <CardDescription>
          Experimenta amb els colors base del tema. Els canvis s'apliquen a l'instant
          i es perden en refrescar la pàgina.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label className="text-base font-medium">Selecciona una Paleta Predefinida:</Label>
          <Popover open={isPaletteComboboxOpen} onOpenChange={setIsPaletteComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isPaletteComboboxOpen}
                className="w-full justify-between mt-2 md:w-[300px]"
              >
                {selectedPaletteName || "Selecciona una paleta..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
              <Command>
                <CommandInput placeholder="Cerca paleta..." />
                <CommandList>
                  <CommandEmpty>No s'ha trobat cap paleta.</CommandEmpty>
                  <CommandGroup>
                    {PREDEFINED_PALETTES.map((palette) => (
                      <CommandItem
                        key={palette.name}
                        value={palette.name}
                        onSelect={() => applyPalette(palette)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedPaletteName === palette.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {palette.name}
                      </CommandItem>
                    ))}
                     <CommandItem
                        key="personalitzada"
                        value="Personalitzada"
                        disabled={true} 
                        className={cn(selectedPaletteName === "Personalitzada" ? "font-semibold" : "text-muted-foreground")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedPaletteName === "Personalitzada" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        (Personalitzada)
                      </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base font-medium hover:no-underline">
              <Palette className="mr-2 h-5 w-5" /> Controls de Color Individuals HSL
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {THEME_COLOR_VARIABLES.map(variable => (
                  currentColors[variable.cssVar] ? (
                    <ColorController
                      key={variable.cssVar}
                      label={variable.label}
                      cssVar={variable.cssVar}
                      hsl={currentColors[variable.cssVar]}
                      onColorChange={handleColorChange}
                    />
                  ) : null
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

