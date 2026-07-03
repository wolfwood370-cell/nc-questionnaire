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
import type { Lifestyle } from "@/lib/intake-types";

type Step4LifestyleProps = {
  value: Lifestyle;
  onChange: (v: Lifestyle) => void;
};

export function Step4Lifestyle({ value, onChange }: Step4LifestyleProps) {
  const set = (key: keyof Lifestyle, val: string) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="work_desc">
          Lavoro, ore/settimana, sedentario o in movimento, orari (fissi/turni/notturni){" "}
          <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="work_desc"
          value={value.work_desc}
          onChange={(e) => set("work_desc", e.target.value)}
          placeholder="Es. Lavoro in ufficio 40h/sett, sedentario, orari fissi 9–18. A volte turni serali."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stress_level">
          Stress quotidiano <span className="text-destructive">*</span>
        </Label>
        <Select
          value={value.stress_level}
          onValueChange={(v) => set("stress_level", v)}
        >
          <SelectTrigger id="stress_level">
            <SelectValue placeholder="Seleziona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="molto_alto">Molto alto</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
            <SelectItem value="medio">Medio</SelectItem>
            <SelectItem value="basso">Basso</SelectItem>
            <SelectItem value="molto_basso">Molto basso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sleep_hours">Ore di sonno a notte</Label>
          <Input
            id="sleep_hours"
            value={value.sleep_hours}
            onChange={(e) => set("sleep_hours", e.target.value)}
            placeholder="Es. 6–7"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sleep  ">
            Qualità del sonno <span className="text-destructive">*</span>
          </Label>
          <Select
            value={value.sleep_quality}
            onValueChange={(v) => set("sleep_quality", v)}
          >
            <SelectTrigger id="sleep_quality">
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ottima">Ottima</SelectItem>
              <SelectItem value="buona">Buona</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="scarsa">Scarsa</SelectItem>
              <SelectItem value="pessima">Pessima:ima</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neat_steps">
          Attività quotidiana non sportiva (passi / NEAT){" "}
          <span className="text-destructive">*</span>
        </Label>
        <Select
          value={value.neat_steps}
          onValueChange={(v) => set("neat_steps", v)}
        >
          <SelectTrigger id="neat_steps">
            <SelectValue placeholder="Seleziona una fascia..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="<5000">Meno di 5.000 passi</SelectItem>
            <SelectItem value="5000-7500">5.000 – 7.500 passi</SelectItem>
            <SelectItem value="7500-10000">7.500 – 10.000 passi</SelectItem>
            <SelectItem value="10000-12500">10.000 – 12.500 passi</SelectItem>
            <SelectItem value=">12500">Più di 12.500 passi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="water_liters">Acqua al giorno (litri)</Label>
          <Input
            id="water_liters"
            value={value.water_liters}
            onChange={(e) => set("water_liters", e.target.value)}
            placeholder="Es. 1.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alcohol_week">Alcol a settimana</Label>
          <Input
            id="alcohol_week"
            value={value.alcohol_week}
            onChange={(e) => set("alcohol_week", e.target.value)}
            placeholder="Es. 2 bicchieri di vino"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smoking">Fumo (quante al giorno)</Label>
          <Input
            id="smoking"
            value={value.smoking}
            onChange={(e) => set("smoking", e.target.value)}
            placeholder="Es. 5 sigarette, o 'Non fumo'"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lifestyle_goal">
          Qualcosa nello stile di vita che vuoi migliorare
        </Label>
        <Textarea
          id="lifestyle_goal"
          value={value.lifestyle_goal}
          onChange={(e) => set("lifestyle_goal", e.target.value)}
          placeholder="Es. Vorrei dormire di più, ridurre lo stress da lavoro, camminare di più durante la giornata."
          rows={4}
        />
      </div>
    </div>
  );
}
