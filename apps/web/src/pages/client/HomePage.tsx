import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export default function HomePage() {
  return (
    <div className="grid gap-3">
      <Card>
        <div className="text-xl font-bold">Lavage a domicile</div>
        <div className="mt-2 text-sm text-neutral-700">Find nearby providers. Book. Rate.</div>
        <div className="mt-3">
          <Link className="underline text-sm" to="/search">Search providers</Link>
        </div>
      </Card>
      <Card>
        <div className="font-bold">Fast flow</div>
        <ol className="mt-2 text-sm list-decimal pl-5">
          <li>Search by location</li>
          <li>Compare rating and price</li>
          <li>Book a slot</li>
          <li>Review after completion</li>
        </ol>
      </Card>
    </div>
  );
}
