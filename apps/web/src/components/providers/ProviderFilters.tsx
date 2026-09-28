import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

export function ProviderFilters(props: {
  q: string;
  setQ: (v: string) => void;
  sort: "DISTANCE" | "RATING" | "PRICE";
  setSort: (v: "DISTANCE" | "RATING" | "PRICE") => void;
  minRating: number;
  setMinRating: (v: number) => void;
  maxKm: number;
  setMaxKm: (v: number) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      <Input placeholder="Search name, city" value={props.q} onChange={(e) => props.setQ(e.target.value)} />
      <Select value={props.sort} onChange={(e) => props.setSort(e.target.value as any)}>
        <option value="DISTANCE">Sort: distance</option>
        <option value="RATING">Sort: rating</option>
        <option value="PRICE">Sort: price</option>
      </Select>
      <Select value={String(props.minRating)} onChange={(e) => props.setMinRating(Number(e.target.value))}>
        <option value="0">Min rating: any</option>
        <option value="3">Min rating: 3+</option>
        <option value="4">Min rating: 4+</option>
        <option value="4.5">Min rating: 4.5+</option>
      </Select>
      <Select value={String(props.maxKm)} onChange={(e) => props.setMaxKm(Number(e.target.value))}>
        <option value="2">Max km: 2</option>
        <option value="5">Max km: 5</option>
        <option value="10">Max km: 10</option>
        <option value="20">Max km: 20</option>
        <option value="50">Max km: 50</option>
      </Select>
    </div>
  );
}
