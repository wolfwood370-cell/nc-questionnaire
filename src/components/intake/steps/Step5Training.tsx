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
import type { Training } from "@/lib/intake-types";

type Props = {
  value: Training;
  onChange: (v: Training) => void;
};

export function Step5Training({ value, onChange }: Props) {
  const set = (key: keyof Training, val: string) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="sports_history">Sport praticati e per quanto tempo</Label>
        <Textarea
          id="sports_history"
          value={value.sports_history}
          onChange={(e) => set("sports_history", e.target.value)}
          placeholder="Es. Calcio dai 10 ai 18 anni, nuoto per 3 anni…"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="current_sport">Ultimo o attuale sport (da quando)</Label>
          <Input
            id="current_sport"
            value={value.current_sport}
            onChange={(e) => set("current_sport", e.target.value)}
            placeholder="Es. Palestra da 2 anni"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="favorite_activity">Attività fisica preferita</Label>
          <Input
            id="favorite_activity"
            value={value.favorite_activity}
            onChange={(e) => set("favorite_activity", e.target.value)}
            placeholder="Es. Sollevamento pesi"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="barbell_experience">
          Uso di bilanciere / attrezzi (crossfit, powerlifting, pesistica, kettlebell) e per quanto
        </Label>
        <Textarea
          id="barbell_experience"
          value={value.barbell_experience}
          onChange={(e) => set("barbell_experience", e.target.value)}
          placeholder="Es. Powerlifting da 3 anni, kettlebell saltuariamente."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experience_level">
            Livello di esperienza coi pesi <span className="text-destructive">*</span>
          </Label>
          <Select value={value.experience_level} onValueChange={(v) => set("experience_level", v)}>
            <SelectTrigger id="experience_level">
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="novizio">Novizio</SelectItem>
              <SelectItem value="principiante">Principiante</SelectItem>
              <SelectItem value="intermedio">Intermedio</SelectItem>
              <SelectItem value="avanzato">Avanzato</SelectItem>
              <SelectItem value="master">Master</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="workload">
            Carico di lavoro abituale <span className="text-destructive">*</span>
          </Label>
          <Select value={value.workload} onValueChange={(v) => set("workload", v)}>
            <SelectTrigger id="workload">
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="molto_basso">Molto basso</SelectItem>
              <SelectItem value="basso">Basso</SelectItem>
              <SelectItem value="medio">Medio</SelectItem>
              <SelectItem value="alto">Alto</SelectItem>
              <SelectItem value="molto_alto">Molto alto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recovery_capacity">
            Capacità di recupero <span className="text-destructive">*</span>
          </Label>
          <Select value={value.recovery_capacity} onValueChange={(v) => set("recovery_capacity", v)}>
            <SelectTrigger id="recovery_capacity">
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ottima">Ottima</SelectItem>
              <SelectItem value="buona">Buona</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="scarsa">Scarsa</SelectItem>
              <SelectItem value="pessima">Pessima</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_days_week">
            Giorni massimi di allenamento a settimana <span className="text-destructive">*</span>
          </Label>
          <Select value={value.max_days_week} onValueChange={(v) => set("max_days_week", v)}>
            <SelectTrigger id="max_days_week">
              <SelectValue placeholder="Seleziona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session_minutes">Minuti per sessione</Label>
        <Input
          id="session_minutes"
          value={value.session_minutes}
          onChange={(e) => set("session_minutes", e.target.value)}
          placeholder="Es. 60"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment">
          Dove ti alleni e con quale attrezzatura <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="equipment"
          value={value.equipment}
          onChange={(e) => set("equipment", e.target.value)}
          placeholder="Es. Palestra commerciale ben attrezzata: bilancieri, rack, manubri fino a 40 kg, macchinari."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recent_maxes">
          1RM / 3RM / 5RM recenti con data (Squat, Panca, Stacco, Lento avanti)
        </Label>
        <Textarea
          id="recent_maxes"
          value={value.recent_maxes}
          onChange={(e) => set("recent_maxes", e.target.value)}
          placeholder={"Es.\nSquat 5RM 100 kg (03/2026)\nPanca 1RM 80 kg (05/2026)\nStacco 3RM 130 kg (04/2026)\nLento 5RM 45 kg (05/2026)"}
          rows={5}
        />
      </div>
    </div>
  );
}
