import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Nutrition } from "@/lib/intake-types";

type Props = {
  value: Nutrition;
  onChange: (v: Nutrition) => void;
};

export function Step6Nutrition({ value, onChange }: Props) {
  const set = (key: keyof Nutrition, val: string) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-6">
      <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
        Sezione visibile perché hai dato il consenso ai suggerimenti alimentari.
        Ricorda: i consigli sono a supporto dell'allenamento e vanno sottoposti al tuo medico.
      </p>

      <div className="space-y-2">
        <Label htmlFor="diet_assessment">
          Come valuteresti la tua dieta attuale? <span className="text-destructive">*</span>
        </Label>
        <Select value={value.diet_assessment} onValueChange={(v) => set("diet_assessment", v)}>
          <SelectTrigger id="diet_assessment">
            <SelectValue placeholder="Seleziona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="iper">Ipercalorica</SelectItem>
            <SelectItem value="iso">Isocalorica</SelectItem>
            <SelectItem value="ipo">Ipocalorica</SelectItem>
            <SelectItem value="non_so">Non saprei</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meals_desc">Quanti pasti al giorno e con quali orari</Label>
        <Textarea
          id="meals_desc"
          value={value.meals_desc}
          onChange={(e) => set("meals_desc", e.target.value)}
          placeholder="Es. 4 pasti: colazione 7:30, pranzo 13, spuntino 17, cena 20:30."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diet_history">Diete passate, risultati, oscillazioni yo-yo</Label>
        <Textarea
          id="diet_history"
          value={value.diet_history}
          onChange={(e) => set("diet_history", e.target.value)}
          placeholder="Es. Dieta chetogenica per 6 mesi, -8 kg poi ripresi tutti…"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="foods_love_avoid">Cibi che ami / che eviti</Label>
        <Textarea
          id="foods_love_avoid"
          value={value.foods_love_avoid}
          onChange={(e) => set("foods_love_avoid", e.target.value)}
          placeholder="Es. Amo pasta e pesce. Evito verdure crude."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="intolerances">
          Intolleranze, allergie o esclusioni (mediche, religiose, etiche)
        </Label>
        <Textarea
          id="intolerances"
          value={value.intolerances}
          onChange={(e) => set("intolerances", e.target.value)}
          placeholder="Es. Intolleranza al lattosio, vegetariano/a…"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="who_cooks">Chi cucina e dove mangi di solito</Label>
        <Input
          id="who_cooks"
          value={value.who_cooks}
          onChange={(e) => set("who_cooks", e.target.value)}
          placeholder="Es. Cucino io a casa, pranzo in mensa aziendale."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplements">Integratori che assumi ora</Label>
        <Textarea
          id="supplements"
          value={value.supplements}
          onChange={(e) => set("supplements", e.target.value)}
          placeholder="Es. Creatina 5 g/die, vitamina D 2000 UI/die, whey post-workout."
          rows={3}
        />
      </div>
    </div>
  );
}
