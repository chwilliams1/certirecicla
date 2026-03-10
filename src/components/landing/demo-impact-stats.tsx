"use client";

import { useEffect, useRef, useState } from "react";
import { TreePine, Car, Smartphone, Droplets } from "lucide-react";

type Equivalencies = {
  trees: number;
  kmNotDriven: number;
  smartphonesCharged: number;
  homesEnergized: number;
};

function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current !== target ? 0 : value;
    prevTarget.current = target;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof TreePine;
  value: number;
  label: string;
}) {
  const animated = useCountUp(value);
  return (
    <div className="rounded-xl border bg-card p-4 text-center card-hover">
      <Icon className="mx-auto mb-2 h-6 w-6 text-sage-500" />
      <p className="text-2xl font-bold text-sage-800">
        {animated.toLocaleString("es-CL")}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function DemoImpactStats({
  equivalencies,
  waterSaved,
}: {
  equivalencies: Equivalencies;
  waterSaved: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={TreePine}
        value={equivalencies.trees}
        label="Arboles equivalentes"
      />
      <StatCard
        icon={Car}
        value={equivalencies.kmNotDriven}
        label="Km no recorridos"
      />
      <StatCard
        icon={Smartphone}
        value={equivalencies.smartphonesCharged}
        label="Smartphones cargados"
      />
      <StatCard
        icon={Droplets}
        value={waterSaved}
        label="Litros de agua ahorrados"
      />
    </div>
  );
}
