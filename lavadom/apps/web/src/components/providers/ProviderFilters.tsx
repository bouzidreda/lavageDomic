import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { useI18n } from "../../i18n";

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
  const { t } = useI18n();

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Input placeholder={t("provider.filters.search")} value={props.q} onChange={(e) => props.setQ(e.target.value)} />
      <Select value={props.sort} onChange={(e) => props.setSort(e.target.value as any)}>
        <option value="DISTANCE">{t("provider.filters.sortDistance")}</option>
        <option value="RATING">{t("provider.filters.sortRating")}</option>
        <option value="PRICE">{t("provider.filters.sortPrice")}</option>
      </Select>
      <Select value={String(props.minRating)} onChange={(e) => props.setMinRating(Number(e.target.value))}>
        <option value="0">{t("provider.filters.anyRating")}</option>
        <option value="3">{t("provider.filters.rating3")}</option>
        <option value="4">{t("provider.filters.rating4")}</option>
        <option value="4.5">{t("provider.filters.rating45")}</option>
      </Select>
      <Select value={String(props.maxKm)} onChange={(e) => props.setMaxKm(Number(e.target.value))}>
        <option value="2">{t("provider.filters.km2")}</option>
        <option value="5">{t("provider.filters.km5")}</option>
        <option value="10">{t("provider.filters.km10")}</option>
        <option value="20">{t("provider.filters.km20")}</option>
        <option value="50">{t("provider.filters.km50")}</option>
      </Select>
    </div>
  );
}
